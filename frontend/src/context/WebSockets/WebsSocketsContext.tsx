import { createContext } from 'react'
import type {
  CreateGuessEvent,
  CreateSelectWord,
  CreateSketchEvent,
  GameStarted,
  GuessEvent,
  HintRevealed,
  LeaderboardUpdated,
  PlayerJoined,
  SketchEvent,
  TurnEnded,
  WordSelected,
  WordSelectionStarted,
} from './types'

export type SocketEvents = {
  guess: GuessEvent
  game_started: GameStarted
  leaderboard_updated: LeaderboardUpdated
  turn_ended: TurnEnded
  hint_revealed: HintRevealed
  word_selected: WordSelected
  word_selection_started: WordSelectionStarted
  sketch: SketchEvent
  player_joined: PlayerJoined
  close: CloseEvent
}

export type CreateSocketEvent =
  | CreateGuessEvent
  | CreateSketchEvent
  | CreateSelectWord

export type WebSocketContextValue = {
  subscribe: <K extends keyof SocketEvents>(
    type: K,
    fn: (ev: SocketEvents[K]) => void,
  ) => () => void

  send: (ev: CreateSocketEvent) => void
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(
  null,
)
