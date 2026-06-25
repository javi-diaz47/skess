from dataclasses import dataclass
from typing import Awaitable, Callable, Dict, List

from src.domain.game.events import DomainEvent


@dataclass(frozen=True, slots=True)
class DispatchEvent:
    event: DomainEvent
    room_id: str


@dataclass(frozen=True, slots=True)
class EnvelopeEvent:
    topic: str
    event: DispatchEvent


class EventBus:
    def __init__(self) -> None:
        self.subscribers: Dict[
            str, List[Callable[[DispatchEvent], Awaitable[None]]]
        ] = {}

    def subscribe(
        self, topic: str, handler: Callable[[DispatchEvent], Awaitable[None]]
    ) -> None:
        if topic not in self.subscribers:
            self.subscribers[topic] = []

        self.subscribers[topic].append(handler)

    async def publish(self, events: List[EnvelopeEvent]):
        for ev in events:
            if ev.topic in self.subscribers:
                for handler in self.subscribers[ev.topic]:
                    await handler(ev.event)


event_bus = EventBus()
