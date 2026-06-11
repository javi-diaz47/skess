from typing import List, Literal
from pydantic import BaseModel
from src.ws.connection_manager import UserWebSocket
from src.ws.events.client import SketchPath


class ServerEvent(BaseModel):
    id: str
    type: str


class ServerGuessEvent(ServerEvent):
    type: Literal["guess"]

    message: str
    correct: bool = False

    sender: UserWebSocket


class ServerHintRevealedEvent(ServerEvent):
    type: Literal["hint_revealed"]

    hint: str
    word_letter_count: int


class ServerTurnEndedEvent(ServerEvent):
    type: Literal["turn_ended"]

    hint: str
    word_letter_count: int

    turn_scores: List[UserWebSocket]

    timestamp: float


class ServerGameEndedEvent(ServerEvent):
    type: Literal["game_ended"]

    leaderboard: List[UserWebSocket]


class ServerSketchEvent(ServerEvent):
    type: Literal["sketch"]

    path: SketchPath

    # Sketching now
    sketching: bool

    sender: UserWebSocket


class ServerGameUpdatedEvent(ServerEvent):
    type: Literal["game_updated"]

    sketcher: UserWebSocket

    timestamp: float

    hint: str
    word_letter_count: int

    round: int
    max_rounds: int

    turn: int
    max_turns: int

    guess_limit: int

    leaderboard: List[UserWebSocket]


class ServerWordSelectionStartedEvent(ServerEvent):
    type: Literal["word_selection_started"]

    words: List[str]
    timer: int


class ServerWordSelectedEvent(ServerEvent):
    type: Literal["word_selected"]

    sketcher: UserWebSocket

    hint: str
    word_letter_count: int

    guess_limit: int
    timestamp: float


class ServerGameStartedEvent(ServerEvent):
    type: Literal["game_started"]

    round: int
    max_rounds: int
    turn: int
    max_turns: int

    sketcher: UserWebSocket


class ServerLeaderboardUpdatedEvent(ServerEvent):
    type: Literal["leaderboard_updated"]

    leaderboard: List[UserWebSocket]


class ServerPlayerAbandonedEvent(ServerEvent):
    type: Literal["player_abandoned"]

    message: str

    player: UserWebSocket


class ServerGamePausedEvent(ServerEvent):
    type: Literal["game_paused"]

    reason: str

    message: str


class ServerPlayerJoinedEvent(ServerEvent):
    type: Literal["player_joined"]

    message: str

    player: UserWebSocket
