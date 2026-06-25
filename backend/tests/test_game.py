import asyncio
from typing import List
import pytest
from src.domain.game.engine import Game
from src.domain.game.events import (
    DomainEvent,
    GameStarted,
    HintRevealed,
    LeaderBoardUpdated,
    PlayerGuessedCorrectly,
    PlayerGuessedIncorrectly,
    WordSelected,
    WordSelectionStarted,
)
from src.domain.game.state import (
    ActiveState,
    GameTimeLimit,
    IdleState,
)


class EventCollector:
    def __init__(self):
        self.events: List[DomainEvent] = []

    async def emit(self, events: List[DomainEvent]):
        self.events.extend(events)


@pytest.mark.asyncio
async def test_game_initialization():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
    )

    assert game.users == ["a", "b"]
    assert game._word == ""
    assert game._sketcher_index == -1

    assert isinstance(game._phase, IdleState)


@pytest.mark.asyncio
async def test_start_emits_events():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
    )

    game.start()

    await asyncio.sleep(0)

    assert isinstance(game._phase, ActiveState)
    assert game._phase.state == "choose"

    assert any(isinstance(ev, WordSelectionStarted) for ev in collector.events)

    assert any(isinstance(ev, GameStarted) for ev in collector.events)


@pytest.mark.asyncio
async def test_start_rotates_sketcher():
    collector = EventCollector()

    game = Game(
        users=["a", "b", "c"],
        emit_event=collector.emit,
    )

    game.start()

    first = game._sketcher_index

    game.end()

    await asyncio.sleep(0)

    second = game._sketcher_index

    assert second == (first + 1) % len(game.users)


@pytest.mark.asyncio
async def test_choose_word_emits_event():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=["cat"],
    )

    game.start()

    await asyncio.sleep(0)

    game.handle_choose_word("cat")

    await asyncio.sleep(0)

    assert game._word == "cat"

    assert isinstance(game._phase, ActiveState)
    assert game._phase.state == "guess"

    assert any(isinstance(ev, WordSelected) for ev in collector.events)


@pytest.mark.asyncio
async def test_choose_invalid_word_does_not_change_state():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=["cat"],
    )

    game.start()

    await asyncio.sleep(0)

    game.handle_choose_word("dog")

    await asyncio.sleep(0)

    assert game._word == ""

    assert game._phase.state == "choose"

    assert not any(isinstance(ev, WordSelected) for ev in collector.events)


@pytest.mark.asyncio
async def test_correct_guess_emits_events():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=["cat"],
    )

    game.start()

    await asyncio.sleep(0)

    sketcher = game._sketcher_id

    guesser = "a" if sketcher == "b" else "b"

    game.handle_choose_word("cat")

    await asyncio.sleep(0)

    game.handle_guess(guesser, "cat")

    await asyncio.sleep(0)

    assert any(isinstance(ev, PlayerGuessedCorrectly) for ev in collector.events)

    assert any(isinstance(ev, LeaderBoardUpdated) for ev in collector.events)


@pytest.mark.asyncio
async def test_incorrect_guess_emits_event():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=["cat"],
    )

    game.start()

    await asyncio.sleep(0)

    game.handle_choose_word("cat")

    await asyncio.sleep(0)

    game.handle_guess("a", "dog")

    await asyncio.sleep(0)

    assert any(isinstance(ev, PlayerGuessedIncorrectly) for ev in collector.events)


@pytest.mark.asyncio
async def test_guess_outside_guess_phase_emit_incorrect_event():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=["cat"],
        time_limits=GameTimeLimit(guess=1),
    )

    game.handle_guess("a", "cat")

    await asyncio.sleep(1.5)

    assert any(isinstance(ev, PlayerGuessedIncorrectly) for ev in collector.events)


@pytest.mark.asyncio
async def test_hint_events_are_emitted():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=["castle"],
        time_limits=GameTimeLimit(guess=1),
    )

    game.start()

    await asyncio.sleep(0)

    game.handle_choose_word("castle")

    await asyncio.sleep(1.5)

    hint_events = [ev for ev in collector.events if isinstance(ev, HintRevealed)]

    assert len(hint_events) > 0


def get_letter_count(word: str):
    count = 0
    for ch in word:
        if ch.isalpha():
            count += 1
    return count


@pytest.mark.asyncio
async def test_hidden_word_generation():
    collector = EventCollector()

    WORD = "ada-love lace"

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=[WORD],
        time_limits=GameTimeLimit(guess=1),
        max_hints=3,
    )

    game.start()

    await asyncio.sleep(0)

    game.handle_choose_word(WORD)

    assert game._hint == "___-____ ____"

    expected = 1

    await asyncio.sleep(2)
    for ev in collector.events:
        if isinstance(ev, HintRevealed):
            if expected == 4:
                expected = get_letter_count(WORD)

            assert get_letter_count(ev.hint) == expected
            expected += 1


@pytest.mark.asyncio
async def test_word_letter_count():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=["ada-love lace"],
    )

    game.start()

    await asyncio.sleep(0)

    game.handle_choose_word("ada-love lace")

    await asyncio.sleep(0)

    assert game.word_letter_count() == 11


@pytest.mark.asyncio
async def test_add_user():
    collector = EventCollector()

    game = Game(
        users=["a"],
        emit_event=collector.emit,
    )

    game.add_user("b")

    assert "b" in game.users


@pytest.mark.asyncio
async def test_remove_user():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
    )

    game.remove_user("a")

    assert "a" not in game.users


@pytest.mark.asyncio
async def test_round_progression():
    collector = EventCollector()

    users = ["a", "b"]

    game = Game(
        users=users,
        emit_event=collector.emit,
        dictionary=["cat"],
        max_rounds=3,
        time_limits=GameTimeLimit(
            choose=0,
            guess=0,
        ),
    )

    expected_round = 0

    for turn in range(6):
        game.start()

        await asyncio.sleep(0)

        expected_turn = (turn % len(users)) + 1

        if turn % len(users) == 0:
            expected_round += 1

        assert game._current_turn == expected_turn
        assert game._current_round == expected_round

        game.handle_choose_word("cat")

        await asyncio.sleep(0)


@pytest.mark.asyncio
async def test_end_emits_turn_end():
    collector = EventCollector()

    game = Game(
        users=["a", "b"],
        emit_event=collector.emit,
        dictionary=["cat"],
        time_limits=GameTimeLimit(guess=1),
    )

    game.start()

    await asyncio.sleep(0)

    game.handle_choose_word("cat")

    await asyncio.sleep(1.5)

    assert any(ev.type == "turn_ended" for ev in collector.events)


@pytest.mark.asyncio
async def test_sketcher_guess_emit_incorrectly_event():
    collector = EventCollector()

    users = ["a", "b"]

    game = Game(
        users=users,
        emit_event=collector.emit,
        dictionary=["cat"],
    )

    game.start()
    await asyncio.sleep(0)

    game.handle_choose_word("cat")
    await asyncio.sleep(0)

    sketcher = game._sketcher_id
    game.handle_guess(sketcher, "cat")
    await asyncio.sleep(0)

    assert any(isinstance(ev, PlayerGuessedIncorrectly) for ev in collector.events)
