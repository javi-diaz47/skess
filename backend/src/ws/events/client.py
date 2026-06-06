from typing import List, Literal, Union
from pydantic import BaseModel


class ClientEvent(BaseModel):
    type: str


class ClientGuessEvent(ClientEvent):
    type: Literal["guess"]

    message: str


class SketchPath(BaseModel):
    points: List[List[float]]
    color: str


class ClientSketchEvent(ClientEvent):
    type: Literal["sketch"]

    path: SketchPath

    # Sketching now
    sketching: bool


class ClientSelectWordEvent(ClientEvent):
    type: Literal["select_word"]

    word: str


class ClientSocketEvent(BaseModel):
    event: Union[ClientGuessEvent, ClientSketchEvent, ClientSelectWordEvent]
