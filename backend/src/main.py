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

    if conn.user.id not in game.users:
        game.add_user(conn.user.id)
        lb = game.get_leaderboard()
        leaderboard = []
        for id, score in lb:
            manager.active_conns[id].user.score = score
            if id in manager.active_conns:
                leaderboard.append(manager.active_conns[id].user.__dict__)

        event_id = str(uuid4())
        await manager.broadcast(
            {
                "event_id": event_id,
                "type": "leaderboard",
                "payload": {"leaderboard": leaderboard},
            }
        )

    if len(manager.active_conns) == 2:
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

            if data["type"] == "start" and len(manager.active_conns) >= 2:
                game.start()
                sketcher_id, words = game.start()
                await manager.send_message(
                    sketcher_id,
                    {"type": "choose_options", "payload": {"words": words}},
                )

            if data["type"] == "choose_selection":
                game.choose(data["payload"]["word"])
                print(f"{data['payload']['word']} was chosen")

            if data["type"] == "guess":
                lb = game.guess(conn.user.id, data["payload"]["message"])

                guessed = len(game.get_guessed())
                total = len(game.users)

                type_status = "guess"

                if guessed == total - 1:
                    lb = game.end()
                    type_status = "end"

                if not lb:
                    event_id = str(uuid4())
                    await manager.broadcast(
                        {
                            "event_id": event_id,
                            "user": conn.user.__dict__,
                            "type": data["type"],
                            "payload": data["payload"],
                        }
                    )
                    continue

                type_status = "leaderboard"

                leaderboard = []
                for id, score in lb:
                    manager.active_conns[id].user.score = score
                    if id in manager.active_conns:
                        leaderboard.append(manager.active_conns[id].user.__dict__)

                event_id = str(uuid4())
                await manager.broadcast(
                    {
                        "event_id": event_id,
                        "type": type_status,
                        "payload": {"leaderboard": leaderboard},
                    }
                )

            if data["type"] == "sketch":
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
        game.remove_user(conn.user.id)
        await manager.broadcast(f"{client_id} disconnected")
