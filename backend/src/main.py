from uuid import uuid4
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from src.utils.colors import COLORS
from src.ws.connection_manager import Connection, ConnectionManager, User
from src.ws.validation_message import validate_message, validate_payload
import random

app = FastAPI(title="Skess")

manager = ConnectionManager()


@app.get("/")
def ping():
    return "pong!"


@app.websocket("/ws/{client_id}/{client_name}")
async def websocket_endpoint(ws: WebSocket, client_id: str, client_name: str):
    conn = Connection(User(client_id, client_name, random.choice(COLORS)), ws)
    await manager.connect(conn)

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
