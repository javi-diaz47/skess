import asyncio
from dataclasses import dataclass
from enum import StrEnum
from typing import Awaitable, Callable, List, Literal, Set, Tuple, Union
from pydantic import BaseModel
from src.game.contants import MAX_SCORE, WORDS
from src.game.leaderboard import Leaderboard, LeaderboardScores
import datetime as dt
import random
import math


@dataclass
class GameTimeLimit:
    choose: int = 10
    guess: int = 35


class Phase(StrEnum):
    START = "start"
    CHOOSE = "choose"
    GUESS = "guess"
    END = "end"


class IdleState(BaseModel):
    state: Literal[Phase.START, Phase.END]
    timestamp: None


class ActiveState(BaseModel):
    state: Literal[Phase.CHOOSE, Phase.GUESS]
    timestamp: dt.datetime


type GameState = Union[IdleState, ActiveState]


class Game:
    def __init__(
        self,
        users: List[str],
        time_limits: GameTimeLimit = GameTimeLimit(),
        max_score: int = MAX_SCORE,
        dictionary=WORDS,
        on_end_game: Callable[[Game], Awaitable[None]] | None = None,
        on_hint: Callable[[List[str], str, int], Awaitable[None]] | None = None,
    ) -> None:
        self._users: List[str] = users

        self._words: List[str] = []
        self._word: str = ""
        self._hint = ""

        self._phase: GameState = IdleState(state=Phase.START, timestamp=None)
        self._leaderboard: Leaderboard = Leaderboard(users)
        self._correct_guessers: Set[str] = set()

        self._sketcher_index: int = -1
        self._sketcher_id: str = ""
        self._time_limits: GameTimeLimit = time_limits

        self._dictionary = dictionary
        self._max_score = max_score
        self._guessers_time = []

        self._on_end_game = on_end_game
        self._on_hint = on_hint

        self._task_on_end: asyncio.Task | None = None
        self._task_on_hint: asyncio.Task | None = None

    @property
    def phase(self) -> GameState:
        return self._phase.model_copy()

    @property
    def word(self) -> str:
        return self._word

    @property
    def state(self) -> str:
        return str(self._phase.state)

    @property
    def correct_guessers(self) -> List[str]:
        return list(self._correct_guessers)

    @property
    def users(self) -> List[str]:
        return list(self._users)

    @property
    def leaderboard(self) -> LeaderboardScores:
        return self._leaderboard.get_leaderboard()

    @property
    def timestamp(self) -> float | None:
        if isinstance(self._phase, ActiveState):
            return dt.datetime.timestamp(self._phase.timestamp)

    @property
    def time_limits(self) -> GameTimeLimit:
        return self._time_limits

    @property
    def sketcher_id(self) -> str:
        return self._sketcher_id

    @property
    def hint(self) -> str:
        return self._hint

    def add_user(self, user_id) -> None:
        self._users.append(user_id)
        self._leaderboard.add_user(user_id)

    def remove_user(self, id) -> None:
        self._users.remove(id)
        self._leaderboard.remove_user(id)

    def start(self) -> Tuple[str, List[str]] | None:
        if isinstance(self._phase, ActiveState):
            return None

        N = len(self._users)

        if self._sketcher_index == -1:
            self._sketcher_index = random.randint(0, N - 1)
        else:
            self._sketcher_index = (self._sketcher_index + 1) % N

        self._reset_round()
        self._set_phase(Phase.CHOOSE)

        self._words = random.choices(self._dictionary, k=3)

        self._sketcher_id = self._users[self._sketcher_index]

        return (self._sketcher_id, self._words.copy())

    def choose(self, word: str) -> bool:
        if self._phase.state != Phase.CHOOSE or word not in self._words:
            return False

        self._word = word
        self._words = []
        self._set_phase(Phase.GUESS)
        self._hint = self._hide_word()

        if self._on_hint is not None:
            self._task_on_hint = asyncio.create_task(self._schedule_hints())

        self._task_on_end = asyncio.create_task(self._schedule_end())

        return True

    def guess(self, user_id: str, guess: str) -> LeaderboardScores | None:
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

            if len(self._correct_guessers) == len(self._users) - 1:
                if self._task_on_hint is not None:
                    self._task_on_hint.cancel()

                if self._task_on_end is not None:
                    self._task_on_end.cancel()

            return self._leaderboard.update_score(user_id, score)

        return None

    def _get_score(self, t: int) -> int:
        return round(-(self._max_score * t / self.time_limits.guess) + self._max_score)

    def end(self) -> LeaderboardScores:
        self._reset_round()
        self._set_phase(Phase.END)
        self._guessers_time = []
        return self._leaderboard.get_leaderboard()

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

        if self._on_end_game is not None:
            await self._on_end_game(self)

        self.end()

    async def _schedule_hints(self) -> None:
        if self._on_hint is None:
            return

        third = self._time_limits.guess // 3

        size = len(self._word)

        hint = list(self._hint)
        max_index = size - 1

        letter_count = self.word_letter_count()

        first_hint_index = random.randint(0, max_index)
        while not self._word[first_hint_index].isalpha():
            first_hint_index = random.randint(0, max_index)

        hint[first_hint_index] = self._word[first_hint_index]

        await asyncio.sleep(third)
        self._hint = "".join(hint)

        await self._on_hint(self.pending_guessers(), self._hint, letter_count)

        if self.word_letter_count() > 3:
            second_hint_index = first_hint_index
            while (
                second_hint_index == first_hint_index
                or not self._word[second_hint_index].isalpha()
            ):
                second_hint_index = random.randint(0, max_index)

            hint[second_hint_index] = self._word[second_hint_index]

            await asyncio.sleep(third)
            self._hint = "".join(hint)
            await self._on_hint(self.pending_guessers(), self._hint, letter_count)

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

        score = 0

        total_guessers = len(self.users) - 1

        print(self._guessers_time)
        for t in self._guessers_time:
            score += t / total_guessers

        print("sketcher score ", score)

        self._leaderboard.update_score(self._sketcher_id, round(score))

    def _reset_round(self) -> None:
        self._word = ""
        self._words = []
        self._hint = ""
        self._sketcher_id = ""
        self._correct_guessers = set()

    def _now(self) -> dt.datetime:
        return dt.datetime.now(tz=dt.UTC)
