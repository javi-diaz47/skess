import random
from typing import List
from src.game.contants import MAX_SCORE, WORDS
from src.game.leaderboard import Leaderboard


class Game:
    def __init__(self, users: List[str]) -> None:
        self.sketcher_index = -1
        self.users = users
        self.N = len(users)
        self.word = ""

        self.state = "start"
        self.lb = Leaderboard(users)

    def start(self):
        if self.sketcher_index == -1:
            self.sketcher_index = int(random.random() * (self.N - 1))
        else:
            self.sketcher_index = (self.sketcher_index + 1) % self.N

        self.state = "choose"
        words = random.choices(WORDS, k=3)
        return (self.users[self.sketcher_index], words)

    def choose(self, word: str):
        self.word = word
        self.state = "guess"

    def guess(self, id, guess):
        if guess == self.word and self.state == "guess":
            return self.lb.updateScore(id, MAX_SCORE)

    def end(self):
        self.state = "end"
        return self.lb.get_leaderboard()

    def add_user(self, id):
        self.users.append(id)
        self.lb.add_user(id)
        self.N = len(self.users)

    def get_state(self) -> str:
        return self.state
