import json
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_conns = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_conns.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_conns.remove(websocket)

    async def send_personal_message(self, websocket: WebSocket, data):
        await websocket.send_json(data)

    async def broadcast(self, data):
        for conn in self.active_conns:
            await conn.send_json(data)
