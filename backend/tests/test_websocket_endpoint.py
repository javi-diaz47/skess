import websockets.asyncio.client as websockets
import pytest
import pytest_asyncio
import threading
import uvicorn
import time
import json
import uuid

from backend.src.main import app


def is_valid_uuid(id: str):
    try:
        uuid.UUID(id)
        return True
    except ValueError:
        return False


def is_valid_event(event, ev_type, ev_payload, ev_user):
    assert is_valid_uuid(event["event_id"])

    assert "type" in event
    assert event["type"] == ev_type

    assert "user" in event
    assert event["user"] == ev_user

    assert "payload" in event
    assert event["payload"] == ev_payload


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
    uri = "ws://127.0.0.1:8000/ws/19cc646c-1b52-4f00-b395-d8bc9efee7f6/ada"
    async with websockets.connect(uri) as ws:
        yield ws


@pytest.mark.asyncio
async def test_guess_message(server, client):
    input_type = "guess"
    input_payload = {"message": "python"}
    user = {"id": "19cc646c-1b52-4f00-b395-d8bc9efee7f6", "name": "ada"}

    input_data = {"type": input_type, "payload": input_payload}
    await client.send(json.dumps(input_data))

    res = await client.recv()
    event = json.loads(res)

    is_valid_event(event, input_type, input_payload, user)


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
