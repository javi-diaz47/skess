from dataclasses import dataclass
from typing import List, Literal, Union

from src.domain.game.leaderboard import LeaderboardScores


@dataclass(frozen=True, slots=True)
class PlayerJoined:
    type: Literal["player_joined"]

    player_id: str


@dataclass(frozen=True, slots=True)
class WordSelectionStarted:
    type: Literal["word_selection_started"]

    sketcher_id: str
    words: List[str]


@dataclass(frozen=True, slots=True)
class WordSelected:
    type: Literal["word_selected"]

    sketcher_id: str
    word: str
    hint: str
    word_letter_count: int

    guess_limit: int
    timestamp: float


@dataclass(frozen=True, slots=True)
class GameStarted:
    type: Literal["game_started"]

    round: int
    max_rounds: int
    turn: int
    max_turns: int


@dataclass(frozen=True, slots=True)
class LeaderBoardUpdated:
    type: Literal["leaderboard_updated"]

    leaderboard: LeaderboardScores


@dataclass(frozen=True, slots=True)
class PlayerGuessedCorrectly:
    type: Literal["player_guessed_correctly"]

    user_id: str

    word: str
    hint: str
    word_letter_count: int


@dataclass(frozen=True, slots=True)
class HintRevealed:
    type: Literal["hint_revealed"]

    hint: str
    word_letter_count: int
    pending_guessers: List[str]

    delay: int


@dataclass(frozen=True, slots=True)
class PlayerGuessedIncorrectly:
    type: Literal["player_guessed_incorrectly"]

    user_id: str
    message: str


@dataclass(frozen=True, slots=True)
class TurnEnded:
    type: Literal["turn_ended"]

    sketcher_id: str
    word: str
    word_letter_count: int

    timestamp: float
    guess_limit: int


type DomainEvent = Union[
    PlayerJoined,
    WordSelectionStarted,
    GameStarted,
    WordSelected,
    LeaderBoardUpdated,
    PlayerGuessedCorrectly,
    PlayerGuessedIncorrectly,
    HintRevealed,
    TurnEnded,
]
