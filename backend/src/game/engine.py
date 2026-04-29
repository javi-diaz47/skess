from dataclasses import dataclass
from typing import List, Literal, Tuple, Union
from pydantic import BaseModel
from src.game.contants import MAX_SCORE, WORDS
from src.game.leaderboard import Leaderboard
import datetime as dt
import random


@dataclass
class GameTimeLimit:
    choose: int = 10
    guess: int = 35


class IdleState(BaseModel):
    state: Literal["start", "end"]


class ActiveState(BaseModel):
    state: Literal["choose", "guess"]
    timestamp: dt.datetime


GameState = Union[IdleState, ActiveState]


class Game:
    def __init__(
        self, users: List[str], time_limits: GameTimeLimit = GameTimeLimit()
    ) -> None:
        self.users = users
        self.word = ""

        self.game_state: GameState = IdleState(state="start")
        self.lb = Leaderboard(users)
        self.guessed = set()

        self.sketcher_index = -1
        self.time_limits = time_limits

        self.words: List[str] = []

    def start(self) -> Tuple[str, List[str]] | None:
        if isinstance(self.game_state, ActiveState):
            return

        N = len(self.users)

        if self.sketcher_index == -1:
            self.sketcher_index = random.randint(0, N - 1)
        else:
            self.sketcher_index = (self.sketcher_index + 1) % N

        self.game_state = ActiveState(
            state="choose", timestamp=dt.datetime.now(tz=dt.UTC)
        )

        self.guessed = set()
        self.words = random.choices(WORDS, k=3)

        return (self.users[self.sketcher_index], self.words)

    def choose(self, word: str):
        if self.game_state.state != "choose" or word not in self.words:
            return

        self.word = word
        self.words = []
        self.game_state = ActiveState(
            state="guess", timestamp=dt.datetime.now(tz=dt.UTC)
        )

    def guess(self, id: str, guess: str):
        if self.game_state.state != "guess":
            return

        now = dt.datetime.now(tz=dt.UTC)
        diff = (now - self.game_state.timestamp).seconds

        if diff > self.time_limits.guess:
            return

        if guess == self.word and id not in self.guessed:
            self.guessed.add(id)
            return self.lb.updateScore(id, MAX_SCORE)

    def end(self):
        self.word = ""
        self.words = []
        self.game_state = IdleState(state="end")
        return self.lb.get_leaderboard()

    def add_user(self, id):
        self.users.append(id)
        self.lb.add_user(id)

    def remove_user(self, id):
        self.users.remove(id)
        self.lb.remove_user(id)

    def get_state(self) -> str:
        return self.game_state.state

    def get_guessed(self) -> List[str]:
        return list(self.guessed)

    def get_leaderboard(self):
        return self.lb.get_leaderboard()

    def get_timestamp(self) -> float | None:
        if isinstance(self.game_state, ActiveState):
            return dt.datetime.timestamp(self.game_state.timestamp)

    def get_time_limits(self) -> GameTimeLimit:
        return self.time_limits

    def is_idle(self) -> bool:
        return isinstance(self.game_state, IdleState)
