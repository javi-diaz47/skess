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

        self.leadingBoard = Leaderboard(users)

    def start(self):
        if self.sketcher_index == -1:
            self.sketcher_index = int(random.random() * (self.N - 1))
        else:
            self.sketcher_index = (self.sketcher_index + 1) % self.N

        words = random.choices(WORDS, k=3)
        return (self.sketcher_index, words)

    def choose(self, word: str):
        self.word = word

    def guess(self, id, guess):
        if guess == self.word:
            return self.leadingBoard.updateScore(id, MAX_SCORE)

    def end(self):
        return self.leadingBoard.get_leaderboard()
