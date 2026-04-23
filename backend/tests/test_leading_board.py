from src.game.leaderboard import Leaderboard


def test_leadingboard_initialization():
    users = ["a", "b", "c"]
    lb = Leaderboard(users)

    assert lb.get_leaderboard() == [("a", 0), ("b", 0), ("c", 0)]


def test_update_score_increases_score():
    lb = Leaderboard(["a"])

    board = lb.updateScore("a", 5)

    assert board == [("a", 5)]


def test_update_score_sorts_descending():
    lb = Leaderboard(["a", "b"])

    lb.updateScore("a", 5)
    lb.updateScore("b", 10)

    board = lb.get_leaderboard()

    assert board == [("b", 10), ("a", 5)]


def test_update_score_unknown_user():
    lb = Leaderboard(["a"])

    board = lb.updateScore("b", 5)

    assert board == [("a", 0)]
