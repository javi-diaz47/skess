from dataclasses import dataclass
from enum import StrEnum
from typing import List, Literal, Set, Tuple, Union
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
        self, users: List[str], time_limits: GameTimeLimit = GameTimeLimit()
    ) -> None:
        self._users: List[str] = users

        self._words: List[str] = []
        self._word: str = ""

        self._phase: GameState = IdleState(state=Phase.START, timestamp=None)
        self._leaderboard: Leaderboard = Leaderboard(users)
        self._guessed: Set[str] = set()

        self._sketcher_index: int = -1
        self._sketcher_id: str = ""
        self._time_limits: GameTimeLimit = time_limits

    def _now(self) -> dt.datetime:
        return dt.datetime.now(tz=dt.UTC)

    def _set_choose_phase(self) -> None:
        self._phase = ActiveState(state=Phase.CHOOSE, timestamp=self._now())

    def _set_guess_phase(self) -> None:
        self._phase = ActiveState(state=Phase.GUESS, timestamp=self._now())

    def _set_end_phase(self) -> None:
        self._phase = IdleState(state=Phase.END, timestamp=None)

    def _reset_round(self) -> None:
        self._word = ""
        self._words = []
        self._sketcher_id = ""
        self._guessed = set()

    def start(self) -> Tuple[str, List[str]] | None:
        if isinstance(self._phase, ActiveState):
            return None

        N = len(self._users)

        if self._sketcher_index == -1:
            self._sketcher_index = random.randint(0, N - 1)
        else:
            self._sketcher_index = (self._sketcher_index + 1) % N

        self._reset_round()
        self._set_choose_phase()

        self._words = random.choices(WORDS, k=3)

        self._sketcher_id = self._users[self._sketcher_index]

        return (self._sketcher_id, self._words.copy())

    def choose(self, word: str) -> bool:
        if self._phase.state != Phase.CHOOSE or word not in self._words:
            return False

        self._word = word
        self._words = []
        self._set_guess_phase()
        return True

    def guess(self, user_id: str, guess: str) -> LeaderboardScores | None:
        if self._phase.state != Phase.GUESS:
            return None

        now = dt.datetime.now(tz=dt.UTC)
        diff = (now - self._phase.timestamp).seconds

        if diff > self._time_limits.guess:
            return None

        if (
            guess == self._word
            and user_id not in self._guessed
            and user_id != self._sketcher_id
        ):
            self._guessed.add(user_id)
            return self._leaderboard.update_score(user_id, MAX_SCORE)

        return None

    def _add_sketcher_score(self) -> None:
        if self._sketcher_id not in self._users:
            return None

        guessed_count = len(self._guessed)
        total_guessed_users = len(self._users) - 1

        score = min(
            math.floor(MAX_SCORE / total_guessed_users * guessed_count), MAX_SCORE
        )

        self._leaderboard.update_score(self._sketcher_id, score)

    def end(self) -> LeaderboardScores:
        self._add_sketcher_score()
        self._reset_round()
        self._set_end_phase()
        return self._leaderboard.get_leaderboard()

    def add_user(self, user_id) -> None:
        self._users.append(user_id)
        self._leaderboard.add_user(user_id)

    def remove_user(self, id) -> None:
        self._users.remove(id)
        self._leaderboard.remove_user(id)

    def get_phase(self) -> GameState:
        return self._phase.model_copy()

    def get_state(self) -> str:
        return str(self._phase.state)

    def get_guessed(self) -> List[str]:
        return list(self._guessed)

    def get_users(self) -> List[str]:
        return list(self._users)

    def get_leaderboard(self) -> LeaderboardScores:
        return self._leaderboard.get_leaderboard()

    def get_timestamp(self) -> float | None:
        if isinstance(self._phase, ActiveState):
            return dt.datetime.timestamp(self._phase.timestamp)

    def get_time_limits(self) -> GameTimeLimit:
        return self._time_limits

    def is_idle(self) -> bool:
        return isinstance(self._phase, IdleState)
