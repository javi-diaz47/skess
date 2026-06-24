from typing import Dict, List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from src.utils.colors import COLORS
from src.ws.connection_manager import Connection, UserWebSocket
from src.ws.events.client import (
    ClientGuessEvent,
    ClientSelectWordEvent,
    ClientSketchEvent,
    ClientSketchPathEvent,
    ClientSocketEvent,
)
from src.ws.events.server import (
    ServerSketchEvent,
    ServerPlayerAbandonedEvent,
    ServerSketchPathEvent,
)
from src.application.orchestration import manager, game_rooms
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
        ws,
        UserWebSocket(
            id=client_id, name=client_name, color=random.choice(COLORS), score=0
        ),
        room_id=_room_id,
    )
    await manager.connect(conn)

    game = game_rooms.rooms[_room_id].game

    game.handle_join(user_id=conn.user.id)
    print("user in room", _room_id)

    try:
        while True:
            try:
                data = await ws.receive_json()

                ev = ClientSocketEvent(event=data).event
                match ev:
                    case ClientSelectWordEvent():
                        game.handle_choose_word(ev.word)

                    case ClientGuessEvent():
                        game.handle_guess(conn.user.id, ev.message)

                    case ClientSketchPathEvent():
                        game.handle_add_path(ev.path, ev.sketching)

                    case ClientSketchEvent():
                        game.handle_update_sketch(ev.sketch)

            except ValidationError as e:
                await manager.send_invalid_schema(conn.user.id, data)

    except WebSocketDisconnect:
        game.remove_user(conn.user.id)
        manager.disconnect(conn)

        player_abandoned_ev = ServerPlayerAbandonedEvent(
            id=str(uuid4()),
            type="player_abandoned",
            message=f"{conn.user.name} abandoned the room",
            player=conn.user,
        )

        users_except_self = [
            user_id for user_id in game.users if user_id != conn.user.id
        ]
        await manager.multicast(users_except_self, player_abandoned_ev.model_dump())
