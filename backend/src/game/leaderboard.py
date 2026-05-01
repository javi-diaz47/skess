from typing import Dict, List, Tuple

type LeaderboardScores = List[Tuple[str, int]]


class Leaderboard:
    def __init__(self, users_id: List[str]) -> None:
        self._scores: Dict[str, int] = {user_id: 0 for user_id in users_id}

    def update_score(self, user_id: str, score: int) -> LeaderboardScores:
        if user_id in self._scores:
            self._scores[user_id] += score

        return self.get_leaderboard()

    def add_user(self, user_id: str) -> None:
        if user_id not in self._scores:
            self._scores[user_id] = 0

    def remove_user(self, user_id: str) -> None:
        self._scores.pop(user_id)

    def get_leaderboard(self) -> LeaderboardScores:
        return sorted(
            list(self._scores.items()), key=lambda user: user[1], reverse=True
        )
