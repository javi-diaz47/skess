from typing import Dict, List
from uuid import uuid4
import uuid
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from src.game.engine import Game, GameTimeLimit, Phase
from dataclasses import dataclass
from src.utils.colors import COLORS
from src.ws.connection_manager import Connection, ConnectionManager, User
from src.ws.validation_message import validate_message, validate_payload
from src.ws.websocket_events import (
    ChooseOptionsEvent,
    ChooseSelectionEvent,
    DisconnectEvent,
    GuessEvent,
    LeaderboardEvent,
    PayloadChooseOptions,
    PayloadLeaderboard,
    PayloadStatusEvent,
    PayloadGuess,
    SketchEvent,
    SocketEvent,
    StatusEvent,
    UserWebSocket,
)
import random

app = FastAPI(title="Skess")

manager = ConnectionManager()


@app.get("/")
def ping():
    return "pong!"


GAME_CHOOSE_TIME_LIMIT = 10
GAME_GUESS_TIME_LIMIT = 35


def create_leaderboard(conns: Dict[str, Connection], positions):
    leaderboard = []
    for id, score in positions:
        conns[id].user.score = score
        if id in manager.active_conns:
            leaderboard.append(manager.active_conns[id].user.__dict__)
    return leaderboard


async def end_game(game: Game):
    correct_guess_message_ev = StatusEvent(
        event_id=str(uuid.uuid4()),
        type="status",
        payload=PayloadStatusEvent(
            status="hint", hint=game.word, word_letter_count=game.word_letter_count()
        ),
    )
    await manager.multicast(game.users, correct_guess_message_ev.model_dump())

    leaderboard = create_leaderboard(manager.active_conns, game.leaderboard)

    lb_event = LeaderboardEvent(
        event_id=str(uuid4()),
        type="leaderboard",
        payload=PayloadLeaderboard(leaderboard=leaderboard),
    )
    await manager.multicast(game.users, lb_event.model_dump())

    sketcher_id = game.sketcher_id
    sketcher = manager.active_conns[sketcher_id].user

    end_ev = StatusEvent(
        type="status",
        payload=PayloadStatusEvent(
            status="end",
            sketcher=UserWebSocket(**sketcher.__dict__),
            hint=game.word,
            word_letter_count=game.word_letter_count(),
        ),
        timestamp=game.timestamp,
        game_guess_limit=game.time_limits.guess,
    )
    await manager.multicast(game.users, end_ev.model_dump())


async def send_hint(
    pending_guessers_id: List[str], hint: str, letter_count: int
) -> None:
    ev = StatusEvent(
        event_id=str(uuid.uuid4()),
        type="status",
        payload=PayloadStatusEvent(
            status="hint", hint=hint, word_letter_count=letter_count
        ),
    )

    await manager.multicast(pending_guessers_id, ev.model_dump())


MAX_ROOM_CAPACITY = 2


@dataclass
class Room:
    id: str
    game: Game
    capacity: int


class GameRooms:
    rooms: Dict[str, Room] = {}

    def __init__(self, room_number: int) -> None:
        for i in range(room_number):
            room_id = f"room-{i}"

            newRoom = Room(
                id=room_id,
                game=Game(
                    users=[],
                    time_limits=GameTimeLimit(
                        choose=GAME_CHOOSE_TIME_LIMIT, guess=GAME_GUESS_TIME_LIMIT
                    ),
                    on_end_game=end_game,
                    on_hint=send_hint,
                ),
                capacity=MAX_ROOM_CAPACITY,
            )

            self.rooms[room_id] = newRoom

    def get_available_room(self) -> str | None:
        room_id: str | None = None

        for r_id in self.rooms:
            if len(self.rooms[r_id].game.users) < self.rooms[r_id].capacity:
                room_id = r_id
                break

        return room_id


gameRooms = GameRooms(2)


@app.websocket("/ws/{client_id}/{client_name}")
async def websocket_endpoint(ws: WebSocket, client_id: str, client_name: str):
    room_id = gameRooms.get_available_room()

    if room_id is None:
        await ws.close(code=1008, reason="No room available")
        return

    conn = Connection(
        ws, User(client_id, client_name, random.choice(COLORS)), room_id=room_id
    )
    await manager.connect(conn)

    game = gameRooms.rooms[room_id].game

    if conn.user.id not in game.users:
        game.add_user(conn.user.id)
        positions = game.leaderboard

        leaderboard = create_leaderboard(manager.active_conns, game.leaderboard)

        lb_event = LeaderboardEvent(
            event_id=str(uuid4()),
            type="leaderboard",
            payload=PayloadLeaderboard(leaderboard=leaderboard),
        )
        await manager.multicast(game.users, lb_event.model_dump())

        if game.state == Phase.GUESS:
            sketcher_id = game.sketcher_id
            sketcher = manager.active_conns[sketcher_id].user

            status_ev = StatusEvent(
                event_id=str(uuid4()),
                type="status",
                payload=PayloadStatusEvent(
                    status="guess",
                    sketcher=UserWebSocket(**sketcher.__dict__),
                    hint=game.hint,
                    word_letter_count=game.word_letter_count(),
                ),
                timestamp=game.timestamp,
                game_guess_limit=game.time_limits.guess,
            )
            await manager.send_personal_message(conn, status_ev.model_dump())

    if len(game.users) == 2 and game.is_idle():
        _game = game.start()
        print(_game)
        if _game is not None:
            sketcher_id, words = _game
            ev = ChooseOptionsEvent(
                event_id=str(uuid4()),
                type="choose_options",
                payload=PayloadChooseOptions(words=words),
            )
            await manager.send_message(sketcher_id, ev.model_dump())

            ev = StatusEvent(
                event_id=str(uuid4()),
                type="status",
                payload=PayloadStatusEvent(status="start"),
            )
            await manager.multicast(game.users, ev.model_dump())

    try:
        while True:
            data = await ws.receive_json()

            val = validate_message(data)
            if val["error"]:
                await manager.send_personal_message(conn, val)
                continue

            val = validate_payload(data)
            if val["error"]:
                await manager.send_personal_message(conn, val)
                continue

            ev = SocketEvent(event=data).event

            match ev:
                case StatusEvent():
                    if ev.payload.status == "end":
                        continue

                    if len(manager.active_conns) < 2:
                        # send error message not enough players
                        continue

                    _game = game.start()
                    if _game is None:
                        continue

                    sketcher_id, words = _game
                    choose_ev = ChooseOptionsEvent(
                        event_id=str(uuid4()),
                        type="choose_options",
                        payload=PayloadChooseOptions(words=words),
                    )
                    await manager.send_message(sketcher_id, choose_ev.model_dump())

                    status_ev = StatusEvent(
                        event_id=str(uuid4()),
                        type="status",
                        payload=PayloadStatusEvent(status="start"),
                    )
                    await manager.multicast(game.users, status_ev.model_dump())

                case ChooseSelectionEvent():
                    game.choose(ev.payload.word)

                    sketcher_id = game.sketcher_id
                    sketcher = manager.active_conns[sketcher_id].user

                    status_ev = StatusEvent(
                        event_id=str(uuid4()),
                        type="status",
                        payload=PayloadStatusEvent(
                            status="guess",
                            sketcher=UserWebSocket(**sketcher.__dict__),
                            hint=game.hint,
                            word_letter_count=game.word_letter_count(),
                        ),
                        timestamp=game.timestamp,
                        game_guess_limit=game.time_limits.guess,
                    )

                    users_except_self = [
                        user_id for user_id in game.users if user_id != conn.user.id
                    ]
                    await manager.multicast(users_except_self, status_ev.model_dump())

                    status_ev.payload.hint = game.word
                    await manager.send_message(conn.user.id, status_ev.model_dump())

                    print(f"{ev.payload.word} was chosen")

                case GuessEvent():
                    positions = game.guess(conn.user.id, ev.payload.message)

                    # user didn't guess correctly
                    if not positions:
                        ev.event_id = str(uuid4())
                        ev.user = UserWebSocket(**conn.user.__dict__)
                        await manager.multicast(game.users, ev.model_dump())
                        continue

                    # user guessed correctly - update leaderboard
                    leaderboard = create_leaderboard(manager.active_conns, positions)

                    lb_event = LeaderboardEvent(
                        event_id=str(uuid4()),
                        type="leaderboard",
                        payload=PayloadLeaderboard(leaderboard=leaderboard),
                    )
                    await manager.multicast(game.users, lb_event.model_dump())

                    correct_guess_message_ev = GuessEvent(
                        event_id=str(uuid4()),
                        user=UserWebSocket(**conn.user.__dict__),
                        type="guess",
                        payload=PayloadGuess(
                            message=f"{conn.user.name} guessed the word", correct=True
                        ),
                    )
                    await manager.multicast(
                        game.users, correct_guess_message_ev.model_dump()
                    )

                    correct_guess_hint_ev = StatusEvent(
                        event_id=str(uuid4()),
                        type="status",
                        payload=PayloadStatusEvent(
                            status="hint",
                            hint=game.word,
                            word_letter_count=game.word_letter_count(),
                        ),
                    )
                    await manager.send_personal_message(
                        conn, correct_guess_hint_ev.model_dump()
                    )

                    if len(game.correct_guessers) == len(game.users) - 1:
                        await game._schedule_end(wait=False)

                case SketchEvent():
                    ev.event_id = str(uuid4())
                    ev.user = UserWebSocket(**conn.user.__dict__)

                    users_except_self = [
                        user_id for user_id in game.users if user_id != conn.user.id
                    ]
                    await manager.multicast(users_except_self, ev.model_dump())

    except WebSocketDisconnect:
        manager.disconnect(conn)
        game.remove_user(conn.user.id)

        # multicast disconnection
        disconnect_ev = DisconnectEvent(
            event_id=str(uuid4()),
            type="disconnect",
            user=UserWebSocket(**conn.user.__dict__),
        )
        await manager.multicast(game.users, disconnect_ev.model_dump())

        # update leaderboard
        leaderboard = create_leaderboard(manager.active_conns, game.leaderboard)
        lb_event = LeaderboardEvent(
            event_id=str(uuid4()),
            type="leaderboard",
            payload=PayloadLeaderboard(leaderboard=leaderboard),
        )
        await manager.multicast(game.users, lb_event.model_dump())
