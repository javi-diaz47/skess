from typing import Dict, List
from fastapi import WebSocket


class User:
    id: str
    name: str
    color: str
    score: int

    def __init__(self, id: str, name: str, color: str):
        self.id = id
        self.name = name
        self.color = color


class Connection:
    user: User
    ws: WebSocket

    def __init__(self, user: User, ws: WebSocket):
        self.user = user
        self.ws = ws


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

    async def send_message(self, id: str, data):
        if id in self.active_conns:
            conn = self.active_conns[id]
            await conn.ws.send_json(data)

    async def send_personal_message(self, conn: Connection, data):
        await conn.ws.send_json(data)

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
