from src.game.contants import MAX_SCORE
from src.game.engine import Game


def test_game_initialization():
    users = ["a", "b"]
    game = Game(users)

    assert game.users == users
    assert game.N == 2
    assert game.word == ""
    assert game.sketcher_index == -1


def test_start_returns_valid_data():
    users = ["a", "b", "c"]
    game = Game(users)

    sketcher_index, words = game.start()

    assert 0 <= sketcher_index < len(users)
    assert len(words) == 3


def test_start_rotates_sketcher():
    users = ["a", "b", "c"]
    game = Game(users)

    first, _ = game.start()
    second, _ = game.start()

    assert second == (first + 1) % len(users)


def test_choose_sets_word():
    game = Game(["a", "b"])

    game.choose("rocket")

    assert game.word == "rocket"


def test_guess_correct_updates_score():
    game = Game(["a", "b"])
    game.choose("rocket")

    result = game.guess("a", "rocket")

    assert result is not None
    assert ("a", MAX_SCORE) in result


def test_guess_incorrect_returns_none():
    game = Game(["a", "b"])
    game.choose("rocket")

    result = game.guess("a", "castle")

    assert result is None


def test_end_returns_leaderboard():
    game = Game(["a", "b"])
    game.choose("rocket")
    game.guess("a", "rocket")

    board = game.end()

    assert ("a", MAX_SCORE) in board
