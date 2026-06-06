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

export type GuessEvent = SocketEvent & {
  type: 'guess'

  message: string
  correct: boolean

  sender: UserWebSocket
}

export type CreateGuessEvent = Omit<GuessEvent, 'id' | 'correct' | 'sender'>

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

export type WordSelectionStarted = SocketEvent & {
  words: string[]
  timer: number
}

export type SelectWord = SocketEvent & {
  type: 'select_word'
  word: string
}

export type WordSelected = SocketEvent & {
  type: 'word_selected'

  word: string
  sketcher: UserWebSocket

  hint: string
  word_letter_count: number

  guess_limit: number
  timestamp: number
}

export type CreateSelectWord = Omit<SelectWord, 'id'>

export type GameStarted = SocketEvent & {
  type: 'game_started'

  round: number
  max_rounds: number
  turn: number
  max_turns: number
}

export type LeaderboardUpdated = SocketEvent & {
  type: 'leaderboard_updated'
  leaderboard: UserWebSocket[]
}

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

export type PlayerAbandoned = SocketEvent & {
  type: 'player_abandoned'

  message: string

  player: UserWebSocket
}

export type GamePaused = SocketEvent & {
  type: 'game_paused'

  reason: string

  message: string
}

export type PlayerJoined = SocketEvent & {
  type: 'player_joined'

  message: string

  player: UserWebSocket
}
