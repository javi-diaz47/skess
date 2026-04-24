import asyncio
import websockets.asyncio.client as websockets
import pytest
import pytest_asyncio
import threading
import uvicorn
import time
import json
import uuid
from backend.src.main import app
from typing import List


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
    for key in ev_user:
        assert event["user"][key] == ev_user[key]

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
    conns = []

    async def _connect(id: str):
        uri = f"ws://127.0.0.1:8000/ws/{id}/ada"
        ws = await websockets.connect(uri)
        conns.append(ws)
        return ws

    yield _connect

    for ws in conns:
        await ws.close()


# Guess Tests


@pytest.mark.asyncio
async def test_guess_message(server, client):
    client1 = await client(str(uuid.uuid4()))

    client2_id = str(uuid.uuid4())
    client2 = await client(client2_id)

    _type = "guess"
    _user = {"id": client2_id, "name": "ada"}
    _payload = {"message": "python"}

    input_data = {"type": _type, "user": _user, "payload": _payload}
    await client2.send(json.dumps(input_data))

    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(client1.recv())
        task2 = tg.create_task(client2.recv())

    event = json.loads(task1.result())
    if event["type"] == "guess":
        is_valid_event(event, _type, _payload, _user)

    event = json.loads(task2.result())
    if event["type"] == "guess":
        is_valid_event(event, _type, _payload, _user)


@pytest.mark.asyncio
async def test_no_type_in_message(server, client):
    client1 = await client(str(uuid.uuid4()))

    input_data = {}
    await client1.send(json.dumps(input_data))

    res = await client1.recv()
    assert json.loads(res) == {
        "error": "Invalid Message",
        "message": "No type was provided",
    }


@pytest.mark.asyncio
async def test_no_payload_in_message(server, client):
    client1 = await client(str(uuid.uuid4()))

    input_data = {"type": "guess"}
    await client1.send(json.dumps(input_data))

    res = await client1.recv()
    assert json.loads(res) == {
        "error": "Invalid Message",
        "message": "No payload was provided",
    }


@pytest.mark.asyncio
async def test_no_message_in_payload(server, client):
    client1 = await client(str(uuid.uuid4()))

    input_data = {"type": "guess", "payload": {}}
    await client1.send(json.dumps(input_data))

    res = await client1.recv()
    assert json.loads(res) == {
        "error": "Invalid Message",
        "message": "Payload must include a property message of type string",
    }


# Sketch Tests


@pytest.mark.asyncio
async def test_path(server, client):
    client1_id = str(uuid.uuid4())
    client1 = await client(client1_id)

    client2 = await client(str(uuid.uuid4()))

    _type = "sketch"
    _user = {"id": client1_id, "name": "ada"}
    _payload = {
        "color": "#db2777",
        "path": "M128.73,272.03 Q135.06,271.49 138.20,271.36 T144.27,270.91 150.30,270.42 156.45,270.20 162.55,269.59 169.07,268.54 175.51,267.75 180.64,267.31 186.47,266.53 191.85,265.81 194.06,265.75 195.10,266.06 195.99,266.69 196.63,267.56 196.96,268.60 196.94,269.69 196.58,270.71 195.91,271.57 195.00,272.16 193.95,272.43 192.86,272.36 191.86,271.94 191.04,271.22 190.50,270.28 190.28,269.21 190.42,268.13 190.89,267.16 191.65,266.38 192.62,265.89 193.70,265.73 194.77,265.92 195.72,266.45 196.45,267.25 196.89,268.24 196.99,269.33 196.74,270.39 196.16,271.31 195.32,272.00 194.30,272.38 193.77,272.49 190.63,272.54 185.27,272.88 181.01,273.18 176.18,273.39 170.03,274.16 163.14,275.39 156.66,276.11 150.77,276.30 144.72,276.78 138.59,277.24 132.43,277.67 128.91,277.96 128.20,277.85 127.54,277.58 126.97,277.16 126.51,276.61 126.20,275.97 126.05,275.27 126.07,274.55 126.26,273.87 126.61,273.24 127.10,272.72 127.70,272.34 128.38,272.10 Z",
        "sketching": False,
    }

    input_data = {"type": _type, "payload": _payload}
    await client1.send(json.dumps(input_data))

    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(client1.recv())
        task2 = tg.create_task(client2.recv())

    event = json.loads(task1.result())
    if event["type"] == "guess":
        is_valid_event(event, _type, _payload, _user)

    event = json.loads(task2.result())
    if event["type"] == "guess":
        is_valid_event(event, _type, _payload, _user)


@pytest.mark.asyncio
async def test_no_path_in_payload(server, client):
    client1 = await client(str(uuid.uuid4()))
    _ = await client(str(uuid.uuid4()))

    _type = "sketch"
    _payload = {
        "color": "#db2777",
        "sketching": False,
    }

    input_data = {"type": _type, "payload": _payload}
    await client1.send(json.dumps(input_data))

    res = await client1.recv()
    event = json.loads(res)

    if "type" in event:
        res = await client1.recv()
        event = json.loads(res)

    assert event == {
        "error": "Invalid Message",
        "message": "Payload must include a property path of type string",
    }


@pytest.mark.asyncio
async def test_no_color_in_payload(server, client):
    client1 = await client(str(uuid.uuid4()))
    _ = await client(str(uuid.uuid4()))

    _type = "sketch"
    _payload = {
        "path": "M128.73,272.03 Q135.06,271.49 138.20,271.36 T144.27,270.91 150.30,270.42 156.45,270.20 162.55,269.59 169.07,268.54 175.51,267.75 180.64,267.31 186.47,266.53 191.85,265.81 194.06,265.75 195.10,266.06 195.99,266.69 196.63,267.56 196.96,268.60 196.94,269.69 196.58,270.71 195.91,271.57 195.00,272.16 193.95,272.43 192.86,272.36 191.86,271.94 191.04,271.22 190.50,270.28 190.28,269.21 190.42,268.13 190.89,267.16 191.65,266.38 192.62,265.89 193.70,265.73 194.77,265.92 195.72,266.45 196.45,267.25 196.89,268.24 196.99,269.33 196.74,270.39 196.16,271.31 195.32,272.00 194.30,272.38 193.77,272.49 190.63,272.54 185.27,272.88 181.01,273.18 176.18,273.39 170.03,274.16 163.14,275.39 156.66,276.11 150.77,276.30 144.72,276.78 138.59,277.24 132.43,277.67 128.91,277.96 128.20,277.85 127.54,277.58 126.97,277.16 126.51,276.61 126.20,275.97 126.05,275.27 126.07,274.55 126.26,273.87 126.61,273.24 127.10,272.72 127.70,272.34 128.38,272.10 Z",
        "sketching": False,
    }

    input_data = {"type": _type, "payload": _payload}
    await client1.send(json.dumps(input_data))

    res = await client1.recv()
    event = json.loads(res)

    if "type" in event:
        res = await client1.recv()
        event = json.loads(res)

    assert json.loads(res) == {
        "error": "Invalid Message",
        "message": "Payload must include a string property color representing the path’s hexadecimal color.",
    }


@pytest.mark.asyncio
async def test_no_sketching_in_payload(server, client):
    client1 = await client(str(uuid.uuid4()))
    _ = await client(str(uuid.uuid4()))

    _type = "sketch"
    _payload = {
        "path": "M128.73,272.03 Q135.06,271.49 138.20,271.36 T144.27,270.91 150.30,270.42 156.45,270.20 162.55,269.59 169.07,268.54 175.51,267.75 180.64,267.31 186.47,266.53 191.85,265.81 194.06,265.75 195.10,266.06 195.99,266.69 196.63,267.56 196.96,268.60 196.94,269.69 196.58,270.71 195.91,271.57 195.00,272.16 193.95,272.43 192.86,272.36 191.86,271.94 191.04,271.22 190.50,270.28 190.28,269.21 190.42,268.13 190.89,267.16 191.65,266.38 192.62,265.89 193.70,265.73 194.77,265.92 195.72,266.45 196.45,267.25 196.89,268.24 196.99,269.33 196.74,270.39 196.16,271.31 195.32,272.00 194.30,272.38 193.77,272.49 190.63,272.54 185.27,272.88 181.01,273.18 176.18,273.39 170.03,274.16 163.14,275.39 156.66,276.11 150.77,276.30 144.72,276.78 138.59,277.24 132.43,277.67 128.91,277.96 128.20,277.85 127.54,277.58 126.97,277.16 126.51,276.61 126.20,275.97 126.05,275.27 126.07,274.55 126.26,273.87 126.61,273.24 127.10,272.72 127.70,272.34 128.38,272.10 Z",
        "color": "#db2777",
    }

    input_data = {"type": _type, "payload": _payload}
    await client1.send(json.dumps(input_data))

    res = await client1.recv()
    event = json.loads(res)

    if "type" in event:
        res = await client1.recv()
        event = json.loads(res)

    assert json.loads(res) == {
        "error": "Invalid Message",
        "message": "Payload must include a boolean property sketching indicating whether the path is finished.",
    }
