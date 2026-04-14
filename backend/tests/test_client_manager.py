import websockets
import pytest
import threading
import uvicorn
import time
import json
from backend.src.main import app


@pytest.fixture
def server():
    server_thread = threading.Thread(
        target=uvicorn.run,
        args=(app,),
        kwargs={"host": "127.0.0.1", "port": 8000, "log_level": "critical"},
        daemon=True,
    )
    server_thread.start()
    time.sleep(1)
    yield


@pytest.mark.asyncio
async def test_websocket_guess_message(server):
    uri = "ws://127.0.0.1:8000/ws/0"

    async with websockets.connect(uri) as ws:
        expected = {"type": "guess", "payload": {"message": "python"}}
        await ws.send(json.dumps(expected))

        res = await ws.recv()
        assert json.loads(res) == expected

        # no type
        input_data = {}
        await ws.send(json.dumps(input_data))
        res = await ws.recv()
        assert json.loads(res) == {
            "error": "Invalid Message",
            "message": "No type was provided",
        }

        # no payload
        input_data = {"type": "guess"}
        await ws.send(json.dumps(input_data))

        res = await ws.recv()
        assert json.loads(res) == {
            "error": "Invalid Message",
            "message": "No payload was provided",
        }

        # payload doesn' match guess structure
        input_data = {"type": "guess", "payload": {}}
        await ws.send(json.dumps(input_data))

        res = await ws.recv()
        assert json.loads(res) == {
            "error": "Invalid Message",
            "message": "Payload must contain a property message of type string",
        }
