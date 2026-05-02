import { createContext, useEffect, useState } from "react"

export interface UserSession {
  id: string
  name: string
  color?: string
}

type CreateUserSession = Omit<UserSession, "id" | "color">

export interface SessionContext {
  session: UserSession
  isLoading: boolean
  hasSession: () => boolean
  onCreateSession: (newSession: CreateUserSession) => void
  onDeleteSession: () => void
}

export const SessionContext = createContext<SessionContext>(null)

export const SessionProvider = ({ children }) => {

  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getLocalSession = () => {
    const data = localStorage.getItem("session")
    if (data === null) return;

    const newSession: UserSession = JSON.parse(data)
    setSession(newSession)
  }

  const setLocalSession = (session: UserSession) => {
    const data = JSON.stringify(session)
    localStorage.setItem("session", data)
  }

  useEffect(() => {
    getLocalSession()
    setIsLoading(false)
  }, [])

  const onCreateSession = (createSession: CreateUserSession) => {
    if (hasSession()) return;

    const newSession: UserSession = { id: crypto.randomUUID(), ...createSession }
    setSession(newSession)
    setLocalSession(newSession)
  }

  const onDeleteSession = () => {
    if (!hasSession()) return;
    setSession(null)
    localStorage.removeItem("session")
  }

  const hasSession = () => {
    return session !== null
  }


  return (
    <SessionContext.Provider value={{ session, isLoading, hasSession, onCreateSession, onDeleteSession }}>
      {children}
    </SessionContext.Provider>
  )
}
