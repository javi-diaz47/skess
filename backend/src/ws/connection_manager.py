from dataclasses import dataclass
from typing import Dict, List
from fastapi import WebSocket
from src.ws.events.invalid_message import INVALID_WEBSOCKET_MESSAGE


@dataclass(slots=True)
class UserWebSocket:
    id: str
    name: str
    color: str
    score: int


@dataclass
class Connection:
    ws: WebSocket
    user: UserWebSocket
    room_id: str


class ConnectionManager:
    def __init__(self):
        self.active_conns: Dict[str, Connection] = {}

    async def connect(self, conn: Connection):
        if conn.user.id in self.active_conns:
            prev_conn = self.active_conns[conn.user.id]
            await prev_conn.ws.close(4002, "Session replaced by new login")
            self.disconnect(prev_conn)

        await conn.ws.accept()
        self.active_conns[conn.user.id] = conn

    def disconnect(self, conn: Connection):
        if conn.user.id not in self.active_conns:
            return

        to_delete = self.active_conns[conn.user.id]

        if to_delete.ws == conn.ws:
            self.active_conns.pop(to_delete.user.id)

    async def send_message(self, user_id: str, data):
        if user_id in self.active_conns:
            conn = self.active_conns[user_id]
            await conn.ws.send_json(data)

    async def send_personal_message(self, user_id: str, data):
        await self.active_conns[user_id].ws.send_json(data)

    async def send_invalid_schema(self, user_id: str, data):
        await self.active_conns[user_id].ws.send_json(
            {**INVALID_WEBSOCKET_MESSAGE, "received": data}
        )

    async def broadcast(self, data: Dict):
        for id in self.active_conns:
            await self.active_conns[id].ws.send_json(data)

    async def multicast(self, users_id: List[str], data: Dict):
        for user_id in users_id:
            if user_id in self.active_conns:
                await self.active_conns[user_id].ws.send_json(data)

    async def broadcast_except_self(self, conn: Connection, data: Dict):
        for user_id in self.active_conns:
            if user_id != conn.user.id:
                await self.active_conns[user_id].ws.send_json(data)
