import datetime as dt
from typing import Dict
from uuid import uuid4
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from src.game.engine import Game
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


game: Game = Game([])


def create_leaderboard(conns: Dict[str, Connection], positions):
    leaderboard = []
    for id, score in positions:
        conns[id].user.score = score
        if id in manager.active_conns:
            leaderboard.append(manager.active_conns[id].user.__dict__)
    return leaderboard


@app.websocket("/ws/{client_id}/{client_name}")
async def websocket_endpoint(ws: WebSocket, client_id: str, client_name: str):
    conn = Connection(User(client_id, client_name, random.choice(COLORS)), ws)
    await manager.connect(conn)

    start_timestamp = 0
    if conn.user.id not in game.users:
        game.add_user(conn.user.id)
        positions = game.get_leaderboard()

        leaderboard = create_leaderboard(manager.active_conns, game.get_leaderboard())

        lb_event = LeaderboardEvent(
            event_id=str(uuid4()),
            type="leaderboard",
            payload=PayloadLeaderboard(leaderboard=leaderboard),
        )
        await manager.broadcast(lb_event.model_dump())

    start_timestamp = dt.datetime.now(tz=dt.UTC).timestamp()
    if len(manager.active_conns) == 2:
        sketcher_id, words = game.start()
        ev = ChooseOptionsEvent(
            event_id=str(uuid4()),
            type="choose_options",
            payload=PayloadChooseOptions(words=words),
            timestamp=start_timestamp,
        )
        await manager.send_message(sketcher_id, ev.model_dump())

        ev = StatusEvent(
            event_id=str(uuid4()),
            type="status",
            payload=PayloadStatusEvent(status="start"),
        )
        await manager.broadcast(ev.model_dump())

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

                    start_timestamp = dt.datetime.now(tz=dt.UTC).timestamp()

                    sketcher_id, words = game.start()
                    choose_ev = ChooseOptionsEvent(
                        event_id=str(uuid4()),
                        type="choose_options",
                        payload=PayloadChooseOptions(words=words),
                        timestamp=start_timestamp,
                    )
                    await manager.send_message(sketcher_id, choose_ev.model_dump())

                    status_ev = StatusEvent(
                        event_id=str(uuid4()),
                        type="status",
                        payload=PayloadStatusEvent(status="start"),
                    )
                    await manager.broadcast(status_ev.model_dump())

                case ChooseSelectionEvent():
                    game.choose(ev.payload.word)
                    print(f"{ev.payload.word} was chosen")

                case GuessEvent():
                    positions = game.guess(conn.user.id, ev.payload.message)

                    # user didn't guess correctly
                    if not positions:
                        ev.event_id = str(uuid4())
                        ev.user = UserWebSocket(**conn.user.__dict__)
                        await manager.broadcast(ev.model_dump())
                        continue

                    # user guessed correctly - update leaderboard
                    leaderboard = create_leaderboard(manager.active_conns, positions)

                    lb_event = LeaderboardEvent(
                        event_id=str(uuid4()),
                        type="leaderboard",
                        payload=PayloadLeaderboard(leaderboard=leaderboard),
                    )
                    await manager.broadcast(lb_event.model_dump())

                    # All users guessed (except the sketcher) END GAME
                    guessed = len(game.get_guessed())
                    total = len(game.users)

                    # broadcast that user.id guessed correctly
                    correct_guess_ev = GuessEvent(
                        event_id=str(uuid4()),
                        user=UserWebSocket(**conn.user.__dict__),
                        type="guess",
                        payload=PayloadGuess(
                            message=f"{conn.user.name} guessed the word", correct=True
                        ),
                    )
                    await manager.broadcast(correct_guess_ev.model_dump())

                    if guessed == total - 1:
                        game.end()
                        end_event = StatusEvent(
                            event_id=str(uuid4()),
                            type="status",
                            payload=PayloadStatusEvent(status="end"),
                        )
                        await manager.broadcast(end_event.model_dump())

                case SketchEvent():
                    ev.event_id = str(uuid4())
                    ev.user = UserWebSocket(**conn.user.__dict__)
                    await manager.broadcast(ev.model_dump())

    except WebSocketDisconnect:
        manager.disconnect(conn)
        game.remove_user(conn.user.id)

        # broadcast disconnection
        disconnect_ev = DisconnectEvent(
            event_id=str(uuid4()),
            type="disconnect",
            user=UserWebSocket(**conn.user.__dict__),
        )
        await manager.broadcast(disconnect_ev.model_dump())

        # update leaderboard
        leaderboard = create_leaderboard(manager.active_conns, game.get_leaderboard())
        lb_event = LeaderboardEvent(
            event_id=str(uuid4()),
            type="leaderboard",
            payload=PayloadLeaderboard(leaderboard=leaderboard),
        )
        await manager.broadcast(lb_event.model_dump())
