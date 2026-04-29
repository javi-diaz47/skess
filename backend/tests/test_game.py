from src.game.contants import MAX_SCORE
from src.game.engine import Game, GameTimeLimit, IdleState, ActiveState
from time import sleep

WORD_NOT_IN_WORDS_DB = "WORD_NOT_IN_WORDS_DB"


def test_game_initialization():
    users = ["a", "b"]
    game = Game(users)

    assert game.users == users
    assert game.word == ""
    assert game.sketcher_index == -1

    assert isinstance(game.game_state, IdleState)
    assert game.game_state.state == "start"


def test_start_returns_valid_data():
    users = ["a", "b", "c"]
    game = Game(users)

    result = game.start()
    assert result is not None

    sketcher, words = result

    assert sketcher in users
    assert 0 <= game.sketcher_index < len(users)
    assert len(words) == 3

    assert isinstance(game.game_state, ActiveState)
    assert game.game_state.state == "choose"


def test_start_sets_choose_state_with_timestamp():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    assert isinstance(game.game_state, ActiveState)
    assert game.game_state.state == "choose"
    assert game.game_state.timestamp is not None


def test_start_rotates_sketcher():
    users = ["a", "b", "c"]
    game = Game(users)

    first_result = game.start()
    assert first_result is not None
    first = game.sketcher_index

    game.end()

    second_result = game.start()
    assert second_result is not None
    second = game.sketcher_index

    assert second == (first + 1) % len(users)


def test_choose_sets_word_and_guess_state():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    assert game.word == words[0]
    assert isinstance(game.game_state, ActiveState)
    assert game.game_state.state == "guess"
    assert game.game_state.timestamp is not None


def test_choose_rejects_word_not_in_options():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    game.choose(WORD_NOT_IN_WORDS_DB)

    assert game.word == ""
    assert game.game_state.state == "choose"


def test_choose_clears_available_words_after_selection():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    assert game.words == []


def test_end_clears_round_state():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    game.end()

    assert game.word == ""
    assert game.words == []


def test_guess_correct_updates_score():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])

    result = game.guess("a", words[0])

    assert result is not None
    assert ("a", MAX_SCORE) in result


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

    _, words = result
    game.choose(words[0])
    game.guess("a", words[0])

    board = game.end()

    assert ("a", MAX_SCORE) in board
    assert isinstance(game.game_state, IdleState)
    assert game.game_state.state == "end"


def test_add_user_adds_to_users_and_leaderboard():
    game = Game(["a"])

    game.add_user("b")

    assert "b" in game.users
    assert ("b", 0) in game.lb.get_leaderboard()


def test_add_user_affects_sketcher_rotation():
    game = Game(["a", "b"])

    first_result = game.start()
    assert first_result is not None

    game.end()
    game.add_user("c")

    second_result = game.start()
    assert second_result is not None
    second = game.sketcher_index

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
    assert isinstance(game.game_state, ActiveState)


def test_start_resets_guessed_users():
    game = Game(["a", "b"])

    result = game.start()
    assert result is not None

    _, words = result
    game.choose(words[0])
    game.guess("a", words[0])

    assert "a" in game.get_guessed()

    game.end()

    next_round = game.start()
    assert next_round is not None

    assert game.get_guessed() == []


def test_state_transitions_full_flow():
    game = Game(["a", "b"])

    assert isinstance(game.game_state, IdleState)
    assert game.game_state.state == "start"

    result = game.start()
    assert result is not None

    _, words = result
    assert isinstance(game.game_state, ActiveState)
    assert game.game_state.state == "choose"

    game.choose(words[0])
    assert isinstance(game.game_state, ActiveState)
    assert game.game_state.state == "guess"

    game.guess("a", words[0])
    assert game.game_state.state == "guess"

    game.end()
    assert isinstance(game.game_state, IdleState)
    assert game.game_state.state == "end"


def test_remove_user():
    user_id = "a"

    game = Game(["a", "b"])

    game.remove_user(user_id)

    assert user_id not in game.users
