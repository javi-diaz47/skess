from src.game.contants import MAX_SCORE
from src.game.engine import Game


def test_game_initialization():
    users = ["a", "b"]
    game = Game(users)

    assert game.users == users
    assert game.word == ""
    assert game.sketcher_index == -1


def test_start_returns_valid_data():
    users = ["a", "b", "c"]
    game = Game(users)

    _, words = game.start()

    assert 0 <= game.sketcher_index < len(users)
    assert len(words) == 3


def test_start_rotates_sketcher():
    users = ["a", "b", "c"]
    game = Game(users)

    game.start()
    first = game.sketcher_index

    game.start()
    second = game.sketcher_index

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


def test_add_user_adds_to_users_and_leaderboard():
    game = Game(["a"])

    game.add_user("b")

    assert "b" in game.users
    assert ("b", 0) in game.lb.get_leaderboard()


def test_add_user_updates_N():
    game = Game(["a"])

    game.add_user("b")

    assert len(game.users) == 2


def test_add_user_affects_sketcher_rotation():
    game = Game(["a", "b"])

    game.start()

    game.add_user("c")

    game.start()
    second = game.sketcher_index

    assert 0 <= second < 3


def test_add_user_can_guess():
    game = Game(["a", "b"])
    game.choose("rocket")

    game.add_user("c")

    result = game.guess("c", "rocket")

    assert result is not None
    assert ("c", MAX_SCORE) in result


def test_state_transitions_full_flow():
    game = Game(["a", "b"])

    assert game.get_state() == "start"

    _, words = game.start()
    assert game.get_state() == "choose"

    game.choose(words[0])
    assert game.get_state() == "guess"

    game.guess("a", words[0])
    assert game.get_state() == "guess"

    game.end()
    assert game.get_state() == "end"


def test_remove_user():
    user_id = "a"

    game = Game(["a", "b"])

    game.remove_user(user_id)

    assert user_id not in game.users
