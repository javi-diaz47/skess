import { createContext } from 'react'
import type {
  CreateGuessEvent,
  CreateSelectWord,
  CreateSketchEvent,
  GamePaused,
  GameStarted,
  GameUpdated,
  GuessEvent,
  HintRevealed,
  LeaderboardUpdated,
  PlayerAbandoned,
  PlayerJoined,
  SketchEvent,
  TurnEnded,
  WordSelected,
  WordSelectionStarted,
} from './types'

export type SocketEvents = {
  player_joined: PlayerJoined
  player_abandoned: PlayerAbandoned

  game_started: GameStarted
  game_paused: GamePaused
  game_updated: GameUpdated

  word_selection_started: WordSelectionStarted
  word_selected: WordSelected

  sketch: SketchEvent
  guess: GuessEvent
  hint_revealed: HintRevealed

  turn_ended: TurnEnded

  leaderboard_updated: LeaderboardUpdated

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

const DEFAULT_WEBSOCKET_CONTEXT: WebSocketContextValue = {
  subscribe: () => () => {},
  send: () => {},
}

export const WebSocketContext = createContext<WebSocketContextValue>(
  DEFAULT_WEBSOCKET_CONTEXT,
)
