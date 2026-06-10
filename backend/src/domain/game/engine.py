from typing import Callable, Coroutine, List, Set
from src.domain.game.constants import (
    MAX_HINTS,
    MAX_PLAYERS,
    MAX_ROUNDS,
    MAX_SCORE,
    WORDS,
)
from src.domain.game.events import (
    DomainEvent,
    GamePaused,
    GameUpdated,
    GameStarted,
    HintRevealed,
    LeaderboardUpdated,
    PlayerGuessedCorrectly,
    PlayerGuessedIncorrectly,
    PlayerJoined,
    TurnEnded,
    WordSelected,
    WordSelectionStarted,
)
from src.domain.game.leaderboard import Leaderboard, LeaderboardScores
from src.domain.game.state import (
    ActiveState,
    GameState,
    GameTimeLimit,
    IdleState,
    Phase,
)

import datetime as dt
import asyncio
import random


class Game:
    def __init__(
        self,
        users: List[str],
        emit_event: Callable[[List[DomainEvent]], Coroutine[None, None, None]],
        time_limits: GameTimeLimit = GameTimeLimit(),
        max_score: int = MAX_SCORE,
        max_rounds: int = MAX_ROUNDS,
        max_hints: int = MAX_HINTS,
        dictionary=WORDS,
    ) -> None:
        self._users: List[str] = users

        self._words: List[str] = []
        self._word: str = ""
        self._hint = ""

        self._phase: GameState = IdleState(state=Phase.START, timestamp=None)
        self._turn_scores: Leaderboard = Leaderboard(users)
        self._leaderboard: Leaderboard = Leaderboard(users)
        self._correct_guessers: Set[str] = set()

        self._sketcher_index: int = -1
        self._sketcher_id: str = ""
        self._time_limits: GameTimeLimit = time_limits

        self._dictionary = dictionary
        self._max_score = max_score
        self._guessers_time = []

        self._max_hints = max_hints

        self._task_on_end: asyncio.Task | None = None
        self._task_on_hint: asyncio.Task | None = None

        self._current_turn: int = 0
        self._max_turns: int = len(self._users)

        self._current_round: int = 0
        self._max_rounds: int = max(self._current_round, max_rounds)

        self._round_end: bool = True

        self._current_timestamp: float = 0.0

        self._players_who_sketched: Set[str] = set()
        self.emit_event = emit_event

    @property
    def users(self) -> List[str]:
        return self._users

    @property
    def leaderboard(self) -> LeaderboardScores:
        return self._leaderboard.get_leaderboard()

    @property
    def timestamp(self) -> float | None:
        if isinstance(self._phase, ActiveState):
            return dt.datetime.timestamp(self._phase.timestamp)

    def add_user(self, user_id) -> None:
        self._users.append(user_id)
        self._leaderboard.add_user(user_id)
        self._turn_scores.add_user(user_id)
        self._max_turns = len(self._users)

    def remove_user(self, user_id) -> None:
        self._users.remove(user_id)
        self._leaderboard.remove_user(user_id)
        self._max_turns = len(self._users)

        if self._task_on_hint is not None:
            self._task_on_hint.cancel()

        if self._task_on_end is not None:
            self._task_on_end.cancel()

        asyncio.create_task(self._schedule_end(wait=False))

    def handle_join(self, user_id: str) -> None:
        self.add_user(user_id)

        events: List[DomainEvent] = [
            PlayerJoined(type="player_joined", player_id=user_id),
            LeaderboardUpdated(
                type="leaderboard_updated",
                leaderboard=self._leaderboard.get_leaderboard(),
            ),
        ]

        if len(self._users) < 2:
            events.append(
                GamePaused(
                    type="game_paused",
                    reason="not_enough_players",
                    message="At least two players are require to start the game",
                )
            )

        asyncio.create_task(self.emit_event(events))

        if len(self._users) == 2:
            self.start()

        if len(self._users) > 2:
            events: List[DomainEvent] = [
                GameUpdated(
                    type="game_updated",
                    user_id=user_id,
                    sketcher_id=self._sketcher_id,
                    hint=self._hint,
                    word_letter_count=self.word_letter_count(),
                    timestamp=self._current_timestamp,
                    guess_limit=self._time_limits.guess,
                    round=self._current_round,
                    max_rounds=self._max_rounds,
                    turn=self._current_turn,
                    max_turns=self._max_turns,
                    leaderboard=self._leaderboard.get_leaderboard(),
                )
            ]
            asyncio.create_task(self.emit_event(events))

    def start(self) -> None:
        if isinstance(self._phase, ActiveState):
            return None

        N = len(self._users)

        if N < 2:
            events: DomainEvent = [
                GamePaused(
                    type="game_paused",
                    reason="not_enough_players",
                    message="At least two players are require to start the game",
                )
            ]

            asyncio.create_task(self.emit_event(events))
            return

        if self._sketcher_index == -1:
            self._sketcher_index = random.randint(0, N - 1)
        else:
            self._sketcher_index = (self._sketcher_index + 1) % N

        self._reset_round()
        self._set_phase(Phase.CHOOSE)

        self._words = random.choices(self._dictionary, k=3)
        self._sketcher_id = self._users[self._sketcher_index]

        self._current_turn += 1
        self._players_who_sketched.add(self._sketcher_id)

        if self._round_end:
            self._current_round += 1
            self._round_end = False

        events: List[DomainEvent] = [
            WordSelectionStarted(
                type="word_selection_started",
                sketcher_id=self._sketcher_id,
                words=self._words,
                timer=self._time_limits.choose,
            ),
            GameStarted(
                type="game_started",
                round=self._current_round,
                max_rounds=self._max_rounds,
                turn=self._current_turn,
                max_turns=self._max_turns,
            ),
        ]
        asyncio.create_task(self.emit_event(events))

    def handle_choose_word(self, word: str) -> None:
        self.choose(word)

        timestamp = self.timestamp

        if timestamp is None or self._word == "":
            return

        self._current_timestamp = timestamp

        events: List[DomainEvent] = [
            WordSelected(
                type="word_selected",
                sketcher_id=self._sketcher_id,
                hint=self._hint,
                word=self._word,
                word_letter_count=self.word_letter_count(),
                timestamp=self._current_timestamp,
                guess_limit=self._time_limits.guess,
            )
        ]

        asyncio.create_task(self.emit_event(events))

    def choose(self, word: str) -> None:
        if self._phase.state != Phase.CHOOSE or word not in self._words:
            return None

        self._word = word
        self._words = []
        self._set_phase(Phase.GUESS)
        self._hint = self._hide_word()

        self._task_on_hint = asyncio.create_task(self._schedule_hints())

        self._task_on_end = asyncio.create_task(self._schedule_end())

    def handle_guess(self, user_id: str, guess: str) -> None:
        guessed = self.guess(user_id, guess)

        events: List[DomainEvent] = []

        if not guessed:
            events.append(
                PlayerGuessedIncorrectly(
                    type="player_guessed_incorrectly", user_id=user_id, message=guess
                )
            )

        else:
            events.append(
                PlayerGuessedCorrectly(
                    type="player_guessed_correctly",
                    user_id=user_id,
                    word=self._word,
                    hint=self._word,
                    word_letter_count=self.word_letter_count(),
                ),
            )

        asyncio.create_task(self.emit_event(events))

        if len(self._correct_guessers) == len(self._users) - 1:
            asyncio.create_task(self._schedule_end(wait=False))

    def guess(self, user_id: str, guess: str) -> bool:
        if self._phase.state != Phase.GUESS:
            return None

        now = dt.datetime.now(tz=dt.UTC)
        diff = (now - self._phase.timestamp).seconds

        if diff > self._time_limits.guess:
            return None

        score = 0

        if (
            guess == self._word
            and user_id not in self._correct_guessers
            and user_id != self._sketcher_id
        ):
            self._correct_guessers.add(user_id)

            score = self._get_score(diff)
            self._guessers_time.append(score)

            self._turn_scores.replace_score(user_id, score)

            if len(self._correct_guessers) == len(self._users) - 1:
                if self._task_on_hint is not None:
                    self._task_on_hint.cancel()

                if self._task_on_end is not None:
                    self._task_on_end.cancel()

            self._leaderboard.update_score(user_id, score)
            return True

        return False

    def _get_score(self, t: int) -> int:
        return round(-(self._max_score * t / self._time_limits.guess) + self._max_score)

    def end(self):
        self._reset_round()
        self._set_phase(Phase.END)
        self._guessers_time = []

        self.start()

    def pending_guessers(self):
        return [
            user_id
            for user_id in self._users
            if user_id not in self._correct_guessers and user_id != self._sketcher_id
        ]

    def word_letter_count(self) -> int:
        size = 0
        for ch in self._word:
            if ch.isalpha():
                size += 1
        return size

    def is_idle(self) -> bool:
        return isinstance(self._phase, IdleState)

    async def _schedule_end(self, wait=True) -> None:
        if wait:
            await asyncio.sleep(self._time_limits.guess)

        self._add_sketcher_score()

        timestamp = self.timestamp

        if timestamp is None:
            return None

        events: List[DomainEvent] = [
            HintRevealed(
                type="hint_revealed",
                hint=self._word,
                word_letter_count=self.word_letter_count(),
                pending_guessers=self.pending_guessers(),
                delay=0,
            ),
            LeaderboardUpdated(
                type="leaderboard_updated", leaderboard=self.leaderboard
            ),
            TurnEnded(
                type="turn_ended",
                sketcher_id=self._sketcher_id,
                word=self._word,
                word_letter_count=self.word_letter_count(),
                guess_limit=self._time_limits.guess,
                timestamp=timestamp,
                turn_scores=self._turn_scores.get_leaderboard(),
            ),
        ]

        if self._current_turn >= self._max_turns:
            self._current_turn = 0

            if 0 < self._current_round < self._max_rounds:
                self._current_round += 1
                #   Emit new Round Event
                # Show points
                # Show Leaderboard
                # Show Finish Round
                # return

            if self._current_round == self._max_rounds:
                # Show points
                # Show Finish Game
                self._current_round = 0
                self._players_who_sketched = set()
                self._round_end = True

        asyncio.create_task(self.emit_event(events))
        await asyncio.sleep(1.5)
        self.end()

    async def _schedule_hints(self) -> None:
        time_for_each_hint = self._time_limits.guess // (self._max_hints + 1)

        size = len(self._word)

        hint = list(self._hint)
        max_index = size - 1

        letter_count = self.word_letter_count()

        hints_indexes = set()
        hint_index = random.randint(0, max_index)

        events: List[DomainEvent] = []

        for _ in range(self._max_hints):
            while not self._word[hint_index].isalpha() or hint_index in hints_indexes:
                hint_index = random.randint(0, max_index)

            hints_indexes.add(hint_index)

            hint[hint_index] = self._word[hint_index]

            self._hint = "".join(hint)

            events.append(
                HintRevealed(
                    type="hint_revealed",
                    hint=self._hint,
                    word_letter_count=letter_count,
                    pending_guessers=self.pending_guessers(),
                    delay=time_for_each_hint,
                )
            )

        asyncio.create_task(self.emit_event(events))

    def _set_phase(self, new_state: Phase) -> None:
        if new_state == Phase.CHOOSE or new_state == Phase.GUESS:
            self._phase = ActiveState(state=new_state, timestamp=self._now())
        else:
            self._phase = IdleState(state=Phase.END, timestamp=None)

    def _hide_word(self) -> str:
        return "".join(["_" if ch.isalpha() else ch for ch in self._word])

    def _add_sketcher_score(self) -> None:
        if self._sketcher_id not in self._users:
            return None

        total_guessers = len(self._users) - 1

        if total_guessers == 0:
            return None

        av_score = sum(self._guessers_time) / total_guessers
        correct_guessers_ratio = len(self._correct_guessers) / total_guessers

        score = av_score * correct_guessers_ratio * 0.8

        self._leaderboard.update_score(self._sketcher_id, round(score))

    def _reset_round(self) -> None:
        self._word = ""
        self._words = []
        self._hint = ""
        self._sketcher_id = ""
        self._correct_guessers = set()
        self._turn_scores.reset_scores()

        if self._current_turn >= self._max_turns:
            self._current_turn = 0

            if 0 < self._current_round < self._max_rounds:
                self._current_round += 1
                #   Emit new Round Event
                return

            if self._current_round == self._max_rounds:
                self._current_round = 0
                self._players_who_sketched = set()
                self._round_end = True

    def _now(self) -> dt.datetime:
        return dt.datetime.now(tz=dt.UTC)
