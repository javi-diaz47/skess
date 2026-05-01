from src.game.contants import MAX_SCORE
from src.game.engine import Game, GameTimeLimit, IdleState, ActiveState
from time import sleep
import math

WORD_NOT_IN_WORDS_DB = "WORD_NOT_IN_WORDS_DB"


def test_game_initialization():
    users = ["a", "b"]
    game = Game(users)

    assert game._users == users
    assert game._word == ""
    assert game._sketcher_index == -1

    assert isinstance(game.get_phase(), IdleState)
    assert game.get_phase().state == "start"


def test_start_returns_valid_data():
    users = ["a", "b", "c"]
    game = Game(users)

    result = game.start()
    assert result is not None

    sketcher, words = result

    assert sketcher in users
    assert len(words) == 3

    assert isinstance(game.get_phase(), ActiveState)
    assert game.get_phase().state == "choose"


def test_start_sets_choose_state_with_timestamp():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    assert isinstance(game.get_phase(), ActiveState)
    assert game.get_phase().state == "choose"
    assert game.get_phase().timestamp is not None


def test_start_rotates_sketcher():
    users = ["a", "b", "c"]
    game = Game(users)

    first_result = game.start()
    assert first_result is not None
    first = game._sketcher_index

    game.end()

    second_result = game.start()
    assert second_result is not None
    second = game._sketcher_index

    assert second == (first + 1) % len(users)


def test_choose_sets_word_and_guess_state():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    assert game._word == words[0]
    assert isinstance(game.get_phase(), ActiveState)
    assert game.get_phase().state == "guess"
    assert game.get_phase().timestamp is not None


def test_choose_rejects_word_not_in_options():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    game.choose(WORD_NOT_IN_WORDS_DB)

    assert game._word == ""
    assert game.get_phase().state == "choose"


def test_choose_clears_available_words_after_selection():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    assert game._words == []


def test_end_clears_round_state():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    game.end()

    assert game._word == ""
    assert game._words == []


def test_guess_correct_updates_score():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    sketcher_id, words = result
    game.choose(words[0])

    guesser_id = ""
    if sketcher_id == "a":
        guesser_id = "b"
    else:
        guesser_id = "a"

    result = game.guess(guesser_id, words[0])

    assert result is not None
    assert (guesser_id, MAX_SCORE) in result


def test_guess_correct_outside_time_limit():
    game = Game(["a", "b"], GameTimeLimit(guess=1))

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    sleep(2)

    result = game.guess("a", words[0])
    assert result is None


def test_guess_incorrect_returns_none():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    result = game.guess("a", WORD_NOT_IN_WORDS_DB)

    assert result is None


def test_guess_does_nothing_outside_guess_state():
    game = Game(["a", "b"])

    result = game.guess("a", WORD_NOT_IN_WORDS_DB)

    assert result is None


def test_end_returns_leaderboard_and_sets_end_state():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    sketcher_id, words = result
    game.choose(words[0])

    if sketcher_id == "a":
        game.guess("b", words[0])
    else:
        game.guess("a", words[0])

    board = game.end()

    assert ("a", MAX_SCORE) in board
    assert isinstance(game.get_phase(), IdleState)
    assert game.get_phase().state == "end"


def test_add_user_adds_to_users_and_leaderboard():
    game = Game(["a"])

    game.add_user("b")

    assert ("b", 0) in game.get_leaderboard()


def test_add_user_affects_sketcher_rotation():
    game = Game(["a", "b"])

    first_result = game.start()
    assert first_result is not None

    game.end()
    game.add_user("c")

    second_result = game.start()
    assert second_result is not None
    second = game._sketcher_index

    assert 0 <= second < 3


def test_add_user_can_guess():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    game.add_user("c")

    result = game.guess("c", words[0])

    assert result is not None
    assert ("c", MAX_SCORE) in result


def test_start_returns_none_when_game_already_active():
    game = Game(["a", "b"])

    first = game.start()
    assert first is not None

    second = game.start()

    assert second is None
    assert isinstance(game.get_phase(), ActiveState)


def test_start_resets_guessed_users():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    sketcher_id, words = result
    game.choose(words[0])
    game.guess("a", words[0])

    guesser_id = ""
    if sketcher_id == "a":
        guesser_id = "b"
    else:
        guesser_id = "a"

    result = game.guess(guesser_id, words[0])

    assert guesser_id in game.get_guessed()

    game.end()

    next_round = game.start()
    assert next_round is not None

    assert game.get_guessed() == []


def test_state_transitions_full_flow():
    game = Game(["a", "b"])

    assert isinstance(game.get_phase(), IdleState)
    assert game.get_phase().state == "start"

    result = game.start()
    assert result is not None

    _, words = result
    assert isinstance(game.get_phase(), ActiveState)
    assert game.get_phase().state == "choose"

    game.choose(words[0])
    assert isinstance(game.get_phase(), ActiveState)
    assert game.get_phase().state == "guess"

    game.guess("a", words[0])
    assert game.get_phase().state == "guess"

    game.end()
    assert isinstance(game.get_phase(), IdleState)
    assert game.get_phase().state == "end"


def test_remove_user():
    user_id = "a"

    game = Game(["a", "b"])

    game.remove_user(user_id)

    assert user_id not in game._users


def test_end_add_sketcher_score_max_score():
    game = Game(["a", "b", "c"])

    result = game.start()
    assert result is not None

    sketcher_id, words = result
    game.choose(words[0])

    for user_id in ["a", "b", "c"]:
        if user_id != sketcher_id:
            game.guess(user_id, words[0])

    board = game.end()

    expected_sketcher_score = MAX_SCORE

    assert (sketcher_id, expected_sketcher_score) in board


def test_end_add_sketcher_score_only_one_guessed():
    users = ["a", "b", "c"]
    game = Game(users)

    result = game.start()
    assert result is not None

    sketcher_id, words = result
    game.choose(words[0])

    guesser_id = ""
    for user_id in users:
        if user_id != sketcher_id:
            guesser_id = user_id
            break

    game.guess(guesser_id, words[0])

    board = game.end()
    expected_sketcher_score = math.floor(MAX_SCORE / (len(users) - 1))

    assert (sketcher_id, expected_sketcher_score) in board


def test_sketcher_doesnt_score_when_guess():
    users = ["a", "b", "c"]
    game = Game(users)

    result = game.start()
    assert result is not None

    sketcher_id, words = result
    game.choose(words[0])
    game.guess(sketcher_id, words[0])

    assert (sketcher_id, 0) in game.end()
