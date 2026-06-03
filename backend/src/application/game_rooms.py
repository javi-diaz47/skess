from typing import Dict, List
from src.domain.game.contants import (
    GAME_CHOOSE_TIME_LIMIT,
    GAME_GUESS_TIME_LIMIT,
    MAX_PLAYERS,
)
from src.domain.game.engine import Game
from src.domain.game.events import DomainEvent
from dataclasses import dataclass
from src.domain.game.state import GameTimeLimit
from src.application.event_bus import DispatchEvent, EnvelopeEvent, event_bus
from uuid import uuid4


@dataclass(slots=True)
class Room:
    id: str
    game: Game
    capacity: int


class GameRooms:
    rooms: Dict[str, Room] = {}
    _max_rooms: int

    def __init__(self, room_number: int, max_rooms: int = 0) -> None:
        self._max_rooms = max(max_rooms, room_number)

        for i in range(room_number):
            room_id = f"room-{i}"

            async def emit_event(events: List[DomainEvent], room_id=room_id) -> None:
                bus_events: List[EnvelopeEvent] = [
                    EnvelopeEvent(
                        topic=ev.type, event=DispatchEvent(event=ev, room_id=room_id)
                    )
                    for ev in events
                ]
                await event_bus.publish(events=bus_events)

            newRoom = Room(
                id=room_id,
                game=Game(
                    users=[],
                    emit_event=emit_event,
                    time_limits=GameTimeLimit(
                        choose=GAME_CHOOSE_TIME_LIMIT, guess=GAME_GUESS_TIME_LIMIT
                    ),
                ),
                capacity=MAX_PLAYERS,
            )

            self.rooms[room_id] = newRoom

    def is_available(self, room_id):
        if room_id not in self.rooms:
            return False

        if len(self.rooms[room_id].game.users) >= self.rooms[room_id].capacity:
            return False

        return True

    def get_available_room(self, room_code: str) -> str | None:
        room_id: str | None = None

        print(room_code, room_code is None, "<- this")
        if not len(room_code):
            for r_id in self.rooms:
                if self.is_available(r_id):
                    room_id = r_id
                    break
        else:
            if self.is_available(room_code):
                room_id = room_code

        return room_id

    def add_room(
        self, capacity, choose_time_limit: int, guess_time_limit: int
    ) -> str | bool:
        if len(self.rooms) < self._max_rooms:
            room_id = str(uuid4())

            async def emit_event(events: List[DomainEvent], room_id=room_id) -> None:
                print("emitiiiing")
                bus_events: List[EnvelopeEvent] = [
                    EnvelopeEvent(
                        topic=ev.type, event=DispatchEvent(event=ev, room_id=room_id)
                    )
                    for ev in events
                ]
                print("bus events", bus_events)
                await event_bus.publish(events=bus_events)

            self.rooms[room_id] = Room(
                id=room_id,
                capacity=capacity,
                game=Game(
                    users=[],
                    emit_event=emit_event,
                    time_limits=GameTimeLimit(
                        choose=choose_time_limit, guess=guess_time_limit
                    ),
                ),
            )

            return room_id

        return False

    def remove_room(self, room_id) -> None:
        if room_id in self.rooms:
            self.rooms.pop(room_id)
