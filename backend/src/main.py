from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from src.connection_manager import ConnectionManager

app = FastAPI(title="Skess")

manager = ConnectionManager()


@app.get("/")
def ping():
    return "pong!"


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(ws: WebSocket, client_id: int):
    await manager.connect(ws)

    try:
        while True:
            data = await ws.receive_json()

            if "type" not in data:
                await manager.send_personal_message(
                    ws,
                    {
                        "error": "Invalid Message",
                        "message": "No type was provided",
                    },
                )
                continue

            if "payload" not in data:
                await manager.send_personal_message(
                    ws,
                    {
                        "error": "Invalid Message",
                        "message": "No payload was provided",
                    },
                )
                continue

            if "message" not in data["payload"]:
                pass
                await manager.send_personal_message(
                    ws,
                    {
                        "error": "Invalid Message",
                        "message": "Payload must contain a property message of type string",
                    },
                )
                continue

            await manager.broadcast(data)

    except WebSocketDisconnect:
        manager.disconnect(ws)
        await manager.broadcast(f"{client_id} disconnected")
