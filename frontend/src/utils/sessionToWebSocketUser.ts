import type { UserSession } from '../context/session/types'
import type { UserWebSocket } from '../context/WebSockets/types'

export const sessionToUserWebSocket = (session: UserSession): UserWebSocket => {
  return {
    id: session.id,
    name: session.name,
    color: session.color || '#FFFFFF',
    score: 0,
  }
}
