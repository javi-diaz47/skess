import type { UserWebSocket } from '../WebSockets/types'

export type Status = {
  state: 'start' | 'guess' | 'end' | 'hint' | 'pause'
  sketcher: UserWebSocket | null
  timestamp: number | null
  guess_limit: number | null
  hint: string | null
  word_letter_count: number | null
  round: number | null
  max_rounds: number | null
  turn: number | null
  max_turns: number | null
  turn_scores: UserWebSocket[]
}

export interface GameStatusContextValue {
  status: Status
}

export const DEFAULT_STATUS: Status = {
  state: 'pause',
  sketcher: null,
  timestamp: null,
  guess_limit: null,
  hint: null,
  word_letter_count: null,
  round: null,
  max_rounds: null,
  turn: null,
  max_turns: null,
  turn_scores: [],
}
