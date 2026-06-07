import { useState, type ReactNode } from 'react'
import { SessionContext } from './SessionContext'
import type { CreateUserSession, UserSession } from './types'

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const getLocalSession = (): UserSession | null => {
    const data = localStorage.getItem('session')
    if (data === null) return null

    const newSession: UserSession = JSON.parse(data)
    return newSession
  }

  const [session, setSession] = useState<UserSession | null>(getLocalSession)

  const setLocalSession = (session: UserSession) => {
    const data = JSON.stringify(session)
    localStorage.setItem('session', data)
  }

  const onCreateSession = (createSession: CreateUserSession) => {
    if (hasSession()) return

    const newSession: UserSession = {
      id: crypto.randomUUID(),
      ...createSession,
    }
    setSession(newSession)
    setLocalSession(newSession)
  }

  const onDeleteSession = () => {
    if (!hasSession()) return
    setSession(null)
    localStorage.removeItem('session')
  }

  const hasSession = () => {
    return session !== null
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        hasSession,
        onCreateSession,
        onDeleteSession,
      }}>
      {children}
    </SessionContext.Provider>
  )
}
