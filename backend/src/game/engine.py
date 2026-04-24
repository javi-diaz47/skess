import random
from typing import List
from src.game.contants import MAX_SCORE, WORDS
from src.game.leaderboard import Leaderboard


class Game:
    def __init__(self, users: List[str]) -> None:
        self.sketcher_index = -1
        self.users = users
        self.word = ""

        self.state = "start"
        self.lb = Leaderboard(users)
        self.guessed = set()

    def start(self):
        N = len(self.users)

        if self.sketcher_index == -1:
            self.sketcher_index = random.randint(0, N - 1)
        else:
            self.sketcher_index = (self.sketcher_index + 1) % N

        self.state = "choose"
        self.guessed = set()
        words = random.choices(WORDS, k=3)
        return (self.users[self.sketcher_index], words)

    def choose(self, word: str):
        self.word = word
        self.state = "guess"

    def guess(self, id, guess):
        if guess == self.word and id not in self.guessed and self.state == "guess":
            self.guessed.add(id)
            return self.lb.updateScore(id, MAX_SCORE)

    def end(self):
        self.state = "end"
        return self.lb.get_leaderboard()

    def add_user(self, id):
        self.users.append(id)
        self.lb.add_user(id)

    def remove_user(self, id):
        self.users.remove(id)
        self.lb.remove_user(id)

    def get_state(self) -> str:
        return self.state

    def get_guessed(self) -> List[str]:
        return list(self.guessed)
