import type { UserWebSocket } from '../WebSockets/types'

export type Status = {
  state:
    | 'start'
    | 'selection'
    | 'guess'
    | 'end'
    | 'hint'
    | 'pause'
    | 'turn_end'
    | 'round_end'
  sketcher: UserWebSocket | null
  word_selection_timer: number | null
  timestamp: number | null
  guess_limit: number | null
  hint: string | null
  word_letter_count: number | null
  round: number | null
  max_rounds: number | null
  turn: number | null
  max_turns: number | null
  turn_scores: UserWebSocket[]
  leaderboard: UserWebSocket[]
}

export interface GameStatusContextValue {
  status: Status
}

export const DEFAULT_STATUS: Status = {
  state: 'pause',
  sketcher: null,
  word_selection_timer: null,
  timestamp: null,
  guess_limit: null,
  hint: null,
  word_letter_count: null,
  round: null,
  max_rounds: null,
  turn: null,
  max_turns: null,
  turn_scores: [],
  leaderboard: [],
}
