from uuid import uuid4
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from src.game.engine import Game
from src.utils.colors import COLORS
from src.ws.connection_manager import Connection, ConnectionManager, User
from src.ws.validation_message import validate_message, validate_payload
import random

app = FastAPI(title="Skess")

manager = ConnectionManager()


@app.get("/")
def ping():
    return "pong!"


game: Game = Game([])


@app.websocket("/ws/{client_id}/{client_name}")
async def websocket_endpoint(ws: WebSocket, client_id: str, client_name: str):
    conn = Connection(User(client_id, client_name, random.choice(COLORS)), ws)
    await manager.connect(conn)

    if len(manager.active_conns) == 2:
        for id in manager.active_conns.keys():
            game.add_user(id)

        sketcher_id, words = game.start()
        await manager.send_message(
            sketcher_id, {"type": "choose_options", "payload": {"words": words}}
        )

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

            if game is not None:
                if data["type"] == "choose_selection":
                    game.choose(data["payload"]["word"])

                if data["type"] == "guess":
                    res = game.guess(conn.user.id, data["payload"]["message"])
                    print(res)

            event_id = str(uuid4())
            await manager.broadcast(
                {
                    "event_id": event_id,
                    "user": conn.user.__dict__,
                    "type": data["type"],
                    "payload": data["payload"],
                }
            )

    except WebSocketDisconnect:
        manager.disconnect(conn)
        await manager.broadcast(f"{client_id} disconnected")
