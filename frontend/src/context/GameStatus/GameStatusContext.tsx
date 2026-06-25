import { createContext } from 'react'

import { DEFAULT_STATUS, type GameStatusContextValue } from './types'

const DEFAULT_STATUS_CONTEXT: GameStatusContextValue = {
  status: DEFAULT_STATUS,
}

export const GameStatusContext = createContext<GameStatusContextValue>(
  DEFAULT_STATUS_CONTEXT,
)
