import type { UserSession } from '../context/SessionContext'
import type { UserWebSocket } from '../context/WebSockets/WebsSocketsContext'

export const sessionToUserWebSocket = (session: UserSession): UserWebSocket => {
  return {
    id: session.id,
    name: session.name,
    color: session.color || '#FFFFFF',
    score: 0,
  }
}
