import { createContext } from 'react'
import type { CreateUserSession, UserSession } from './types'

export interface SessionContext {
  session: UserSession | null
  onCreateSession: (newSession: CreateUserSession) => void
  onDeleteSession: () => void
}

const DEFAULT_SESSION_CONTEXT: SessionContext = {
  session: null,
  onCreateSession: () => {},
  onDeleteSession: () => {},
}

export const SessionContext = createContext<SessionContext>(
  DEFAULT_SESSION_CONTEXT,
)
