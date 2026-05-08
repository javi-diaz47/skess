from typing import List, Literal, Union
from pydantic import BaseModel


class UserWebSocket(BaseModel):
    id: str
    name: str
    color: str
    score: int


class BaseSocketEvent(BaseModel):
    event_id: str | None = None
    user: UserWebSocket | None = None
    timestamp: float | None = None
    game_guess_limit: int | None = None
    game_choose_limit: int | None = None


class PayloadGuess(BaseModel):
    message: str
    correct: bool | None


class GuessEvent(BaseSocketEvent):
    type: Literal["guess"]
    payload: PayloadGuess


class SketchPayload(BaseModel):
    path: str
    color: str
    sketching: bool


class SketchEvent(BaseSocketEvent):
    type: Literal["sketch"]
    payload: SketchPayload


class PayloadChooseOptions(BaseModel):
    words: List[str]


class ChooseOptionsEvent(BaseSocketEvent):
    type: Literal["choose_options"]
    payload: PayloadChooseOptions


class PayloadChooseSelection(BaseModel):
    word: str


class ChooseSelectionEvent(BaseSocketEvent):
    type: Literal["choose_selection"]
    payload: PayloadChooseSelection


class PayloadLeaderboard(BaseModel):
    leaderboard: List[UserWebSocket]


class LeaderboardEvent(BaseSocketEvent):
    type: Literal["leaderboard"]
    payload: PayloadLeaderboard


class PayloadStatusEvent(BaseModel):
    status: Literal["start", "guess", "end"]
    sketcher: UserWebSocket | None = None
    guess_word: str | None = None


class StatusEvent(BaseSocketEvent):
    type: Literal["status"]
    payload: PayloadStatusEvent


class DisconnectEvent(BaseSocketEvent):
    type: Literal["disconnect"]


class SocketEvent(BaseModel):
    event: Union[
        StatusEvent,
        GuessEvent,
        SketchEvent,
        ChooseOptionsEvent,
        ChooseSelectionEvent,
        LeaderboardEvent,
        DisconnectEvent,
    ]
