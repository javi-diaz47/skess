from src.game.leaderboard import Leaderboard


def test_leadingboard_initialization():
    users = ["a", "b", "c"]
    lb = Leaderboard(users)

    assert lb.get_leaderboard() == [("a", 0), ("b", 0), ("c", 0)]


def test_update_score_increases_score():
    lb = Leaderboard(["a"])

    board = lb.update_score("a", 5)

    assert board == [("a", 5)]


def test_update_score_sorts_descending():
    lb = Leaderboard(["a", "b"])

    lb.update_score("a", 5)
    lb.update_score("b", 10)

    board = lb.get_leaderboard()

    assert board == [("b", 10), ("a", 5)]


def test_update_score_unknown_user():
    lb = Leaderboard(["a"])

    board = lb.update_score("b", 5)

    assert board == [("a", 0)]


def test_add_user_appends_with_zero_score():
    lb = Leaderboard(["a"])

    lb.add_user("b")

    assert lb.get_leaderboard() == [("a", 0), ("b", 0)]


def test_add_user_does_not_duplicate():
    lb = Leaderboard(["a"])

    lb.update_score("a", 10)
    lb.add_user("a")

    assert lb.get_leaderboard() == [("a", 10)]


def test_remove_user():
    lb = Leaderboard(["a", "b"])

    lb.remove_user("a")

    assert ("a", 0) not in lb.get_leaderboard()
