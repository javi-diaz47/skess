import { createContext, useState } from "react"

export interface UserSession {
  name: string
}

export interface SessionContext {
  session: UserSession
  hasSession: () => boolean
  onCreateSession: (newSession: UserSession) => void
}

export const SessionContext = createContext<SessionContext>(null)

export const SessionProvider = ({ children }) => {

  const [session, setSession] = useState<UserSession | null>(null)

  const onCreateSession = (newSession: UserSession) => {
    setSession(newSession)
  }

  const hasSession = () => {
    return session !== null
  }

  return (
    <SessionContext.Provider value={{ session, hasSession, onCreateSession }}>
      {children}
    </SessionContext.Provider>
  )
}
