from dataclasses import dataclass
from enum import StrEnum
from typing import Literal, Union

import datetime as dt


@dataclass
class GameTimeLimit:
    choose: int = 10
    guess: int = 35


class Phase(StrEnum):
    START = "start"
    CHOOSE = "choose"
    GUESS = "guess"
    END = "end"


@dataclass(slots=True)
class IdleState:
    state: Literal[Phase.START, Phase.END]
    timestamp: None


@dataclass(slots=True)
class ActiveState:
    state: Literal[Phase.CHOOSE, Phase.GUESS]
    timestamp: dt.datetime


type GameState = Union[IdleState, ActiveState]
