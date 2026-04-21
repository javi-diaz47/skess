from uuid import uuid4
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from src.ws.connection_manager import Connection, ConnectionManager, User
from src.ws.validation_message import validate_message
import random

app = FastAPI(title="Skess")

manager = ConnectionManager()
colors = [
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
    "slate",
    "gray",
    "zinc",
    "neutral",
    "stone",
    "taupe",
    "mauve",
    "mist",
    "olive",
]


@app.get("/")
def ping():
    return "pong!"


@app.websocket("/ws/{client_id}/{client_name}")
async def websocket_endpoint(ws: WebSocket, client_id: str, client_name: str):
    conn = Connection(User(client_id, client_name, random.choice(colors)), ws)
    await manager.connect(conn)

    try:
        while True:
            data = await ws.receive_json()

            val = validate_message(data)
            if val["error"]:
                await manager.send_personal_message(conn, val)
                continue

            if data["type"] == "guess":
                if "message" not in data["payload"]:
                    await manager.send_personal_message(
                        conn,
                        {
                            "error": "Invalid Message",
                            "message": "Payload must contain a property message of type string",
                        },
                    )
                    continue
            elif data["type"] == "sketch":
                if "path" not in data["payload"]:
                    await manager.send_personal_message(
                        conn,
                        {
                            "error": "Invalid Message",
                            "message": "Payload must contain a property path of type string",
                        },
                    )
                    continue
                if "color" not in data["payload"]:
                    await manager.send_personal_message(
                        conn,
                        {
                            "error": "Invalid Message",
                            "message": "Payload must contain a property color of type string with the hexadecimal color of the path",
                        },
                    )
                    continue
            else:
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
