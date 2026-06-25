from decimal import Rounded
from typing import Dict
from src.domain.game.leaderboard import LeaderboardScores
from src.domain.game.events import (
    AddedPath,
    GameEnded,
    GamePaused,
    GameStarted,
    HintRevealed,
    LeaderboardUpdated,
    PlayerGuessedCorrectly,
    PlayerGuessedIncorrectly,
    PlayerJoined,
    GameUpdated,
    RoundEnded,
    SketchUpdated,
    TurnEnded,
    WordSelected,
    WordSelectionStarted,
)
from src.ws.connection_manager import Connection

from src.ws.events.server import (
    ServerGameEndedEvent,
    ServerGamePausedEvent,
    ServerGameStartedEvent,
    ServerGameUpdatedEvent,
    ServerGuessEvent,
    ServerPlayerJoinedEvent,
    ServerSketchEvent,
    ServerSketchPathEvent,
    ServerWordSelectionStartedEvent,
    ServerWordSelectedEvent,
    ServerLeaderboardUpdatedEvent,
    ServerHintRevealedEvent,
    ServerTurnEndedEvent,
    ServerRoundEndedEvent,
)
from src.application.event_bus import DispatchEvent

from src.application.event_bus import event_bus
from uuid import uuid4

from src.application.game_rooms import GameRooms
from src.ws.connection_manager import ConnectionManager
from src.domain.game.constants import MAX_ROOMS, ROOM_NUMBER

import asyncio

manager = ConnectionManager()

game_rooms = GameRooms(ROOM_NUMBER, MAX_ROOMS)


def create_leaderboard(conns: Dict[str, Connection], positions: LeaderboardScores):
    leaderboard = []
    for user_id, score in positions:
        if user_id in conns:
            conns[user_id].user.score = score
        if user_id in manager.active_conns:
            leaderboard.append(manager.active_conns[user_id].user)
    return leaderboard


async def playerJoinedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, PlayerJoined):
        return

    ev = dispatch.event

    player = manager.active_conns[ev.player_id].user

    new_ev = ServerPlayerJoinedEvent(
        id=str(uuid4()),
        type="player_joined",
        player=player,
        message=f"{player.name} joined the room",
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    users_except_self = [user_id for user_id in players if user_id != ev.player_id]
    await manager.multicast(users_except_self, new_ev.model_dump())


async def gamePausedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, GamePaused):
        return

    ev = dispatch.event

    new_ev = ServerGamePausedEvent(
        id=str(uuid4()), type="game_paused", reason=ev.reason, message=ev.message
    )

    await manager.broadcast(new_ev.model_dump())


async def wordSelectionStartedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, WordSelectionStarted):
        return

    ev = dispatch.event

    sketcher = manager.active_conns[ev.sketcher_id].user

    ws_ev = ServerWordSelectionStartedEvent(
        id=str(uuid4()),
        type="word_selection_started",
        words=ev.words,
        word_selection_timer=ev.word_selection_timer,
        timestamp=ev.timestamp,
        sketcher=sketcher,
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, ws_ev.model_dump())


async def gameStartedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, GameStarted):
        return

    ev = dispatch.event

    sketcher = manager.active_conns[ev.sketcher_id].user

    new_ev = ServerGameStartedEvent(
        id=str(uuid4()),
        type="game_started",
        round=ev.round,
        max_rounds=ev.max_rounds,
        turn=ev.turn,
        max_turns=ev.max_turns,
        sketcher=sketcher,
    )

    await manager.multicast(
        game_rooms.rooms[dispatch.room_id].game.users,
        new_ev.model_dump(),
    )


async def wordSelectedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, WordSelected):
        return

    ev = dispatch.event

    sketcher = manager.active_conns[ev.sketcher_id].user

    new_ev = ServerWordSelectedEvent(
        id=str(uuid4()),
        type="word_selected",
        sketcher=sketcher,
        hint=ev.hint,
        word_letter_count=ev.word_letter_count,
        timestamp=ev.timestamp,
        guess_limit=ev.guess_limit,
    )

    # show hints to players
    players = game_rooms.rooms[dispatch.room_id].game.users
    users_except_self = [user_id for user_id in players if user_id != ev.sketcher_id]
    await manager.multicast(users_except_self, new_ev.model_dump())

    # show the sketcher the word
    new_ev.hint = ev.word
    await manager.send_message(ev.sketcher_id, new_ev.model_dump())


async def leaderboardUpdatedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, LeaderboardUpdated):
        return

    ev = dispatch.event

    # user guessed correctly - update leaderboard
    leaderboard = create_leaderboard(manager.active_conns, ev.leaderboard)

    new_ev = ServerLeaderboardUpdatedEvent(
        id=str(uuid4()), type="leaderboard_updated", leaderboard=leaderboard
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, new_ev.model_dump())


async def playerGuessedCorrectlyHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, PlayerGuessedCorrectly):
        return

    ev = dispatch.event

    user = manager.active_conns[ev.user_id].user

    correct_guess_message_ev = ServerGuessEvent(
        id=str(uuid4()),
        type="guess",
        message=f"{user.name} guessed the word",
        correct=True,
        sender=user,
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, correct_guess_message_ev.model_dump())

    # reveal word to the player
    correct_guess_hint_ev = ServerHintRevealedEvent(
        id=str(uuid4()),
        type="hint_revealed",
        hint=ev.word,
        word_letter_count=ev.word_letter_count,
    )

    await manager.send_personal_message(ev.user_id, correct_guess_hint_ev.model_dump())


async def playerGuessedIncorrectlyHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, PlayerGuessedIncorrectly):
        return

    ev = dispatch.event

    user = manager.active_conns[ev.user_id].user

    guess_event = ServerGuessEvent(
        id=str(uuid4()),
        type="guess",
        message=ev.message,
        correct=False,
        sender=user,
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, guess_event.model_dump())


async def hintRevealedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, HintRevealed):
        return

    ev = dispatch.event

    await asyncio.sleep(ev.delay)

    new_ev = ServerHintRevealedEvent(
        id=str(uuid4()),
        type="hint_revealed",
        hint=ev.hint,
        word_letter_count=ev.word_letter_count,
    )

    await manager.multicast(ev.pending_guessers, new_ev.model_dump())


async def gameUpdatedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, GameUpdated):
        return

    ev = dispatch.event
    sketcher = manager.active_conns[ev.sketcher_id].user
    leaderboard = create_leaderboard(manager.active_conns, ev.leaderboard)

    new_ev = ServerGameUpdatedEvent(
        id=str(uuid4()),
        type="game_updated",
        hint=ev.hint,
        word_letter_count=ev.word_letter_count,
        timestamp=ev.timestamp,
        sketcher=sketcher,
        guess_limit=ev.guess_limit,
        round=ev.round,
        max_rounds=ev.max_rounds,
        turn=ev.turn,
        max_turns=ev.max_turns,
        leaderboard=leaderboard,
        sketch=ev.sketch,
    )

    await manager.send_message(ev.user_id, new_ev.model_dump())


async def turnEndedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, TurnEnded):
        return

    ev = dispatch.event

    turn_scores = create_leaderboard(manager.active_conns, ev.turn_scores)

    end_ev = ServerTurnEndedEvent(
        id=str(uuid4()),
        type="turn_ended",
        hint=ev.word,
        word_letter_count=ev.word_letter_count,
        turn_scores=turn_scores,
        timestamp=ev.timestamp,
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, end_ev.model_dump())

    await asyncio.sleep(ev.cooldown)


async def roundEndedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, RoundEnded):
        return

    ev = dispatch.event

    end_ev = ServerRoundEndedEvent(
        id=str(uuid4()), type="round_ended", round=ev.round, max_rounds=ev.max_rounds
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, end_ev.model_dump())

    await asyncio.sleep(ev.cooldown)


async def gameEndedHandler(dispatch: DispatchEvent):
    if not isinstance(dispatch.event, GameEnded):
        return

    ev = dispatch.event

    leaderboard = create_leaderboard(manager.active_conns, ev.leaderboard)

    end_ev = ServerGameEndedEvent(
        id=str(uuid4()),
        type="game_ended",
        leaderboard=leaderboard,
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    await manager.multicast(players, end_ev.model_dump())

    await asyncio.sleep(ev.cooldown)


async def sketchUpdatedHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, SketchUpdated):
        return

    ev = dispatch.event

    sketcher = manager.active_conns[ev.sketcher_id].user

    new_ev = ServerSketchEvent(
        id=str(uuid4()), type="sketch", sketch=ev.sketch, sender=sketcher
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    users_except_self = [user_id for user_id in players if user_id != ev.sketcher_id]
    await manager.multicast(users_except_self, new_ev.model_dump())


async def addedPathHandler(dispatch: DispatchEvent) -> None:
    if not isinstance(dispatch.event, AddedPath):
        return

    ev = dispatch.event

    sketcher = manager.active_conns[ev.sketcher_id].user

    new_ev = ServerSketchPathEvent(
        id=str(uuid4()),
        type="sketch_path",
        path=ev.path,
        sketching=ev.sketching,
        sender=sketcher,
    )

    players = game_rooms.rooms[dispatch.room_id].game.users
    users_except_self = [user_id for user_id in players if user_id != ev.sketcher_id]
    await manager.multicast(users_except_self, new_ev.model_dump())


event_bus.subscribe("player_joined", playerJoinedHandler)
event_bus.subscribe("word_selection_started", wordSelectionStartedHandler)
event_bus.subscribe("game_started", gameStartedHandler)
event_bus.subscribe("word_selected", wordSelectedHandler)
event_bus.subscribe("leaderboard_updated", leaderboardUpdatedHandler)
event_bus.subscribe("player_guessed_correctly", playerGuessedCorrectlyHandler)
event_bus.subscribe("player_guessed_incorrectly", playerGuessedIncorrectlyHandler)
event_bus.subscribe("hint_revealed", hintRevealedHandler)
event_bus.subscribe("turn_ended", turnEndedHandler)
event_bus.subscribe("game_updated", gameUpdatedHandler)
event_bus.subscribe("game_paused", gamePausedHandler)
event_bus.subscribe("game_ended", gameEndedHandler)
event_bus.subscribe("round_ended", roundEndedHandler)
event_bus.subscribe("sketch_updated", sketchUpdatedHandler)
event_bus.subscribe("added_path", addedPathHandler)
