export type SocketEventError = {
  error: string
  message: string
}

export type SocketEvent = {
  id: string
  type: string
}

export type UserWebSocket = {
  id: string
  name: string
  color: string
  score: number
}

export type PlayerJoined = SocketEvent & {
  type: 'player_joined'

  message: string

  player: UserWebSocket
}

export type PlayerAbandoned = SocketEvent & {
  type: 'player_abandoned'

  message: string

  player: UserWebSocket
}

export type GameStarted = SocketEvent & {
  type: 'game_started'

  round: number
  max_rounds: number
  turn: number
  max_turns: number
}

export type GamePaused = SocketEvent & {
  type: 'game_paused'

  reason: string

  message: string
}

export type GameUpdated = SocketEvent & {
  type: 'game_updated'

  sketcher: UserWebSocket

  timestamp: number

  hint: string
  word_letter_count: number

  round: number
  max_rounds: number

  turn: number
  max_turns: number

  guess_limit: number

  leaderboard: UserWebSocket[]
}

export type GameEnded = SocketEvent & {
  type: 'game_ended'

  leaderboard: UserWebSocket[]
}

export type WordSelectionStarted = SocketEvent & {
  words: string[]
  timer: number
}

export type SelectWord = SocketEvent & {
  type: 'select_word'
  word: string
}

export type CreateSelectWord = Omit<SelectWord, 'id'>

export type WordSelected = SocketEvent & {
  type: 'word_selected'

  word: string
  sketcher: UserWebSocket

  hint: string
  word_letter_count: number

  guess_limit: number
  timestamp: number
}

export interface Path {
  points: number[][]
  color: string
}

export type SketchEvent = SocketEvent & {
  type: 'sketch'

  path: Path

  sketching: boolean

  sender: UserWebSocket
}

export type CreateSketchEvent = Omit<SketchEvent, 'id' | 'sender'>

export type GuessEvent = SocketEvent & {
  type: 'guess'

  message: string
  correct: boolean

  sender: UserWebSocket
}

export type CreateGuessEvent = Omit<GuessEvent, 'id' | 'correct' | 'sender'>

export type HintRevealed = SocketEvent & {
  type: 'hint_revealed'

  hint: string
  word_letter_count: number
}

export type TurnEnded = SocketEvent & {
  type: 'turn_ended'

  hint: string
  word_letter_count: number

  turn_scores: UserWebSocket[]

  timestamp: number
}

export type LeaderboardUpdated = SocketEvent & {
  type: 'leaderboard_updated'
  leaderboard: UserWebSocket[]
}

export type SocketEvents = {
  player_joined: PlayerJoined
  player_abandoned: PlayerAbandoned

  game_started: GameStarted
  game_paused: GamePaused
  game_updated: GameUpdated
  game_ended: GameEnded

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

export interface WebSocketContextValue {
  subscribe: <K extends keyof SocketEvents>(
    type: K,
    fn: (ev: SocketEvents[K]) => void,
  ) => () => void
  send: (ev: CreateSocketEvent) => void
}
