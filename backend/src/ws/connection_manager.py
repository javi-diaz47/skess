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

    async def send_personal_message(self, conn: Connection, data):
        await conn.ws.send_json(data)

    async def broadcast(self, data):
        for id in self.active_conns:
            await self.active_conns[id].ws.send_json(data)
