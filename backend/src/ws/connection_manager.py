from fastapi import WebSocket


class User:
    id: str
    name: str

    def __init__(self, id: str, name: str):
        self.id = id
        self.name = name


class Connection:
    user: User
    ws: WebSocket

    def __init__(self, user: User, ws: WebSocket):
        self.user = user
        self.ws = ws


class ConnectionManager:
    def __init__(self):
        self.active_conns = {}

    async def connect(self, conn: Connection):
        await conn.ws.accept()
        self.active_conns[conn.user.id] = conn

    def disconnect(self, conn: Connection):
        self.active_conns.pop(conn.user.id)

    async def send_personal_message(self, conn: Connection, data):
        await conn.ws.send_json(data)

    async def broadcast(self, data):
        for id in self.active_conns:
            await self.active_conns[id].ws.send_json(data)
