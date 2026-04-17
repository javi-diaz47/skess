from uuid import uuid4
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from src.ws.connection_manager import ConnectionManager
from src.ws.validation_message import validate_message

app = FastAPI(title="Skess")

manager = ConnectionManager()


@app.get("/")
def ping():
    return "pong!"


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(ws: WebSocket, client_id: str):
    await manager.connect(ws)

    try:
        while True:
            data = await ws.receive_json()

            val = validate_message(data)
            if val["error"]:
                await manager.send_personal_message(ws, val)
                continue

            if "message" not in data["payload"]:
                await manager.send_personal_message(
                    ws,
                    {
                        "error": "Invalid Message",
                        "message": "Payload must contain a property message of type string",
                    },
                )
                continue

            event_id = str(uuid4())
            await manager.broadcast(
                {"event_id": event_id, "user_id": client_id, **data}
            )

    except WebSocketDisconnect:
        manager.disconnect(ws)
        await manager.broadcast(f"{client_id} disconnected")
