import { createContext } from 'react'
import type { CreateUserSession, UserSession } from './types'

export interface SessionContext {
  session: UserSession | null
  hasSession: () => boolean
  onCreateSession: (newSession: CreateUserSession) => void
  onDeleteSession: () => void
}

const DEFAULT_SESSION_CONTEXT: SessionContext = {
  session: null,
  hasSession: () => false,
  onCreateSession: () => {},
  onDeleteSession: () => {},
}

export const SessionContext = createContext<SessionContext>(
  DEFAULT_SESSION_CONTEXT,
)
