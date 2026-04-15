import websockets.asyncio.client as websockets
import pytest
import pytest_asyncio
import threading
import uvicorn
import time
import json
from backend.src.main import app


@pytest.fixture(scope="module")
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


@pytest_asyncio.fixture
async def client():
    uri = "ws://127.0.0.1:8000/ws/0"
    async with websockets.connect(uri) as ws:
        yield ws


@pytest.mark.asyncio
async def test_guess_message(server, client):
    input_data = {"type": "guess", "payload": {"message": "python"}}
    await client.send(json.dumps(input_data))

    expected = {"id": "0", **input_data}
    res = await client.recv()

    assert json.loads(res) == expected


@pytest.mark.asyncio
async def test_no_type_in_message(server, client):
    input_data = {}
    await client.send(json.dumps(input_data))

    res = await client.recv()
    assert json.loads(res) == {
        "error": "Invalid Message",
        "message": "No type was provided",
    }


@pytest.mark.asyncio
async def test_no_payload_in_message(server, client):
    input_data = {"type": "guess"}
    await client.send(json.dumps(input_data))

    res = await client.recv()
    assert json.loads(res) == {
        "error": "Invalid Message",
        "message": "No payload was provided",
    }


@pytest.mark.asyncio
async def test_no_message_in_payload(server, client):
    input_data = {"type": "guess", "payload": {}}
    await client.send(json.dumps(input_data))

    res = await client.recv()
    assert json.loads(res) == {
        "error": "Invalid Message",
        "message": "Payload must contain a property message of type string",
    }
