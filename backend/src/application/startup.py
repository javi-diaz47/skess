from src.application.game_rooms import GameRooms
from src.ws.connection_manager import ConnectionManager
from src.domain.game.contants import MAX_ROOMS, ROOM_NUMBER

manager = ConnectionManager()

game_rooms = GameRooms(ROOM_NUMBER, MAX_ROOMS)
