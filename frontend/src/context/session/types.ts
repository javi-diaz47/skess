export interface UserSession {
  id: string
  name: string
  room_id: string
  color?: string
}

export type CreateUserSession = Omit<UserSession, 'id' | 'color'>
