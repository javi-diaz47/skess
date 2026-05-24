from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from src.application.orchestration import create_leaderboard
from src.utils.colors import COLORS
from src.ws.connection_manager import Connection, User
from src.ws.validation_message import validate_message, validate_payload
from src.ws.websocket_events import (
    ChooseSelectionEvent,
    DisconnectEvent,
    GuessEvent,
    LeaderboardEvent,
    PayloadLeaderboard,
    SketchEvent,
    SocketEvent,
    StatusEvent,
    UserWebSocket,
)
from src.application.startup import manager, game_rooms
from uuid import uuid4
import random

app = FastAPI(title="Skess")


@app.get("/")
def ping():
    return "pong!"


@app.websocket("/ws/{client_id}/{client_name}")
async def websocket_endpoint(
    ws: WebSocket, client_id: str, client_name: str, room_id: str = ""
):
    _room_id = game_rooms.get_available_room(room_id)

    if _room_id is None:
        await ws.close(code=1008, reason="No room available")
        return

    conn = Connection(
        ws, User(client_id, client_name, random.choice(COLORS)), room_id=_room_id
    )
    await manager.connect(conn)

    game = game_rooms.rooms[_room_id].game

    game.handle_join(user_id=conn.user.id)

    try:
        while True:
            data = await ws.receive_json()

            val = validate_message(data)
            if val["error"]:
                await manager.send_personal_message(conn.user.id, val)
                continue

            val = validate_payload(data)
            if val["error"]:
                await manager.send_personal_message(conn.user.id, val)
                continue

            ev = SocketEvent(event=data).event

            match ev:
                case StatusEvent():
                    if ev.payload.status == "end":
                        continue

                    if len(manager.active_conns) < 2:
                        # send error message not enough players
                        continue

                    game.handle_start()

                case ChooseSelectionEvent():
                    game.handle_choose_word(ev.payload.word)

                case GuessEvent():
                    game.handle_guess(conn.user.id, ev.payload.message)

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
            # game_round=game.current_round,
            # game_max_round=game.max_rounds,
            # game_turn=game.current_turn,
            # game_max_turn=game.max_turns,
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
