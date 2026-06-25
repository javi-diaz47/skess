export interface UserSession {
  id: string
  name: string
  room_id: string
  color?: string
}

export type CreateUserSession = Omit<UserSession, 'id' | 'color'>

export interface SessionContextValue {
  session: UserSession | null
  onCreateSession: (newSession: CreateUserSession) => void
  onDeleteSession: () => void
}
