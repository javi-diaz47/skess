from os import wait
from typing import List, Literal
from pydantic import BaseModel


class UserWebSocket(BaseModel):
    id: str
    name: str
    color: str
    score: int


class BaseSocketEvent(BaseModel):
    event_id: str | None = None
    user: UserWebSocket | None = None


class GuessPayload(BaseModel):
    message: str


class GuessEvent(BaseSocketEvent):
    type: Literal["guess"]
    payload: GuessPayload


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

:wait(:wait())
class StartEvent(BaseSocketEvent):
    type: Literal["start"]


class EndEvent(BaseSocketEvent):
    type: Literal["end"]


class DisconnectEvent(BaseSocketEvent):
    type: Literal["disconnect"]


class SocketEvent(BaseModel):
    event: Union[
        StartEvent,
        EndEvent,
        GuessEvent,
        SketchEvent,
        ChooseOptionsEvent,
        ChooseSelectionEvent,
        LeaderboardEvent,
        DisconnectEvent,
    ]
