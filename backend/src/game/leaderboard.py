from typing import List, Tuple


class Leaderboard:
    def __init__(self, users_ids: List[str]) -> None:
        self.lb: List[Tuple[str, int]] = [(id, 0) for id in users_ids]

    def updateScore(self, id: str, score: int) -> List[Tuple[str, int]]:
        for i in range(len(self.lb)):
            cur_id, cur_score = self.lb[i]
            if cur_id == id:
                self.lb[i] = (id, cur_score + score)
                self.lb.sort(key=lambda x: x[1], reverse=True)
                break

        return self.lb

    def add_user(self, id: str):
        for lb_id, _ in self.lb:
            if lb_id == id:
                return
        self.lb.append((id, 0))

    def get_leaderboard(self) -> List[Tuple[str, int]]:
        return self.lb
