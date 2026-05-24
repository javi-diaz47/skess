from typing import Dict
from src.domain.game.events import (
    GameStarted,
    HintRevealed,
    LeaderBoardUpdated,
    PlayerGuessedCorrectly,
    PlayerGuessedIncorrectly,
    PlayerJoined,
    TurnEnded,
    WordSelected,
    WordSelectionStarted,
)
from src.ws.connection_manager import Connection
from src.ws.websocket_events import (
    ChooseOptionsEvent,
    GuessEvent,
    LeaderboardEvent,
    PayloadChooseOptions,
    PayloadLeaderboard,
    PayloadStatusEvent,
    PayloadGuess,
    StatusEvent,
    UserWebSocket,
)
from src.application.event_bus import DispatchEvent
from src.application.startup import manager, game_rooms
from src.application.event_bus import event_bus
from uuid import uuid4

import asyncio


def create_leaderboard(conns: Dict[str, Connection], positions):
    leaderboard = []
    for id, score in positions:
        conns[id].user.score = score
        if id in manager.active_conns:
            leaderboard.append(manager.active_conns[id].user.__dict__)
    return leaderboard


async def playerJoinedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, PlayerJoined):
        return

    print(f"{dispatch.event.player_id} player joined")


async def wordSelectionStartedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, WordSelectionStarted):
        return

    ev = dispatch.event

    ws_ev = ChooseOptionsEvent(
        event_id=str(uuid4()),
        type="choose_options",
        payload=PayloadChooseOptions(words=ev.words),
    )

    await manager.send_message(ev.sketcher_id, ws_ev.model_dump())


async def gameStartedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, GameStarted):
        return

    ev = dispatch.event

    status_event = StatusEvent(
        event_id=str(uuid4()),
        type="status",
        payload=PayloadStatusEvent(status="start"),
        game_round=ev.round,
        game_max_round=ev.max_rounds,
        game_turn=ev.turn,
        game_max_turn=ev.max_turns,
    )

    await manager.multicast(
        game_rooms.rooms[dispatch.room_id].game.users,
        status_event.model_dump(),
    )


async def wordSelectedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, WordSelected):
        return

    ev = dispatch.event

    sketcher = manager.active_conns[ev.sketcher_id].user

    status_ev = StatusEvent(
        event_id=str(uuid4()),
        type="status",
        payload=PayloadStatusEvent(
            status="guess",
            sketcher=UserWebSocket(**sketcher.__dict__),
            hint=ev.hint,
            word_letter_count=ev.word_letter_count,
        ),
        timestamp=ev.timestamp,
        game_guess_limit=ev.guess_limit,
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    users_except_self = [user_id for user_id in players if user_id != ev.sketcher_id]
    await manager.multicast(users_except_self, status_ev.model_dump())

    status_ev.payload.hint = ev.word
    await manager.send_message(ev.sketcher_id, status_ev.model_dump())


async def leaderboardUpdatedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, LeaderBoardUpdated):
        return

    ev = dispatch.event

    # user guessed correctly - update leaderboard
    leaderboard = create_leaderboard(manager.active_conns, ev.leaderboard)

    lb_event = LeaderboardEvent(
        event_id=str(uuid4()),
        type="leaderboard",
        payload=PayloadLeaderboard(leaderboard=leaderboard),
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, lb_event.model_dump())


async def playerGuessedCorrectlyHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, PlayerGuessedCorrectly):
        return

    ev = dispatch.event

    user = manager.active_conns[ev.user_id].user

    correct_guess_message_ev = GuessEvent(
        event_id=str(uuid4()),
        user=UserWebSocket(**user.__dict__),
        type="guess",
        payload=PayloadGuess(message=f"{user.name} guessed the word", correct=True),
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, correct_guess_message_ev.model_dump())

    correct_guess_hint_ev = StatusEvent(
        event_id=str(uuid4()),
        type="status",
        payload=PayloadStatusEvent(
            status="hint",
            hint=ev.word,
            word_letter_count=ev.word_letter_count,
        ),
    )
    await manager.send_personal_message(ev.user_id, correct_guess_hint_ev.model_dump())


async def playerGuessedIncorrectlyHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, PlayerGuessedIncorrectly):
        return

    ev = dispatch.event

    user = manager.active_conns[ev.user_id].user

    guess_event = GuessEvent(
        type="guess",
        event_id=str(uuid4()),
        user=UserWebSocket(**user.__dict__),
        payload=PayloadGuess(message=ev.message, correct=False),
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, guess_event.model_dump())


async def hintRevealedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, HintRevealed):
        return

    ev = dispatch.event

    await asyncio.sleep(ev.delay)

    status_event = StatusEvent(
        event_id=str(uuid4()),
        type="status",
        payload=PayloadStatusEvent(
            status="hint", hint=ev.hint, word_letter_count=ev.word_letter_count
        ),
    )

    await manager.multicast(ev.pending_guessers, status_event.model_dump())


async def turnEndedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, TurnEnded):
        return

    ev = dispatch.event

    sketcher = manager.active_conns[ev.sketcher_id].user

    end_ev = StatusEvent(
        type="status",
        payload=PayloadStatusEvent(
            status="end",
            sketcher=UserWebSocket(**sketcher.__dict__),
            hint=ev.word,
            word_letter_count=ev.word_letter_count,
        ),
        timestamp=ev.timestamp,
        game_guess_limit=ev.guess_limit,
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, end_ev.model_dump())


event_bus.subscribe("player_joined", playerJoinedHandler)
event_bus.subscribe("word_selection_started", wordSelectionStartedHandler)
event_bus.subscribe("game_started", gameStartedHandler)
event_bus.subscribe("word_selected", wordSelectedHandler)
event_bus.subscribe("leaderboard_updated", leaderboardUpdatedHandler)
event_bus.subscribe("player_guessed_correctly", playerGuessedCorrectlyHandler)
event_bus.subscribe("player_guessed_incorrectly", playerGuessedIncorrectlyHandler)
event_bus.subscribe("hint_revealed", hintRevealedHandler)
event_bus.subscribe("turn_ended", turnEndedHandler)
