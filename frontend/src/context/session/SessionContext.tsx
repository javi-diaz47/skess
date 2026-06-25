import { createContext } from 'react'
import type { SessionContextValue } from './types'

const DEFAULT_SESSION_CONTEXT: SessionContextValue = {
  session: null,
  onCreateSession: () => {},
  onDeleteSession: () => {},
}

export const SessionContext = createContext<SessionContextValue>(
  DEFAULT_SESSION_CONTEXT,
)
