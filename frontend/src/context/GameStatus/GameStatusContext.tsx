import { createContext } from 'react'

import { DEFAULT_STATUS, type Status } from './types'

export type GameStatusContextValue = {
  status: Status
}

const DEFAULT_STATUS_CONTEXT = {
  status: DEFAULT_STATUS,
}

export const GameStatusContext = createContext<GameStatusContextValue>(
  DEFAULT_STATUS_CONTEXT,
)
