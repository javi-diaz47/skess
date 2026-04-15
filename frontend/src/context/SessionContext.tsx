import { createContext, useEffect, useState } from "react"

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

  const getLocalSession = () => {
    const data = sessionStorage.getItem("session")
    if (data === null) return;

    const newSession: UserSession = JSON.parse(data)
    setSession(newSession)
  }

  const setLocalSession = (session: UserSession) => {
    const data = JSON.stringify(session)
    sessionStorage.setItem("session", data)
  }

  useEffect(() => {
    getLocalSession()
  }, [])

  const onCreateSession = (newSession: UserSession) => {
    setSession(newSession)
    setLocalSession(newSession)
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
