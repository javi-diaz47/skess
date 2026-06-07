import { useContext, useEffect, useState } from 'react'
import { WebSocketContext } from '../context/WebSockets/WebsSocketsContext'
import { SessionContext } from '../context/session/SessionContext'
import { sessionToUserWebSocket } from '../utils/sessionToWebSocketUser'
import type {
  CreateGuessEvent,
  GuessEvent,
  PlayerAbandoned,
  PlayerJoined,
} from '../context/WebSockets/types'

export const useChat = () => {
  const { session } = useContext(SessionContext)
  const { subscribe, send } = useContext(WebSocketContext)

  const [messages, setMessages] = useState<GuessEvent[]>([])

  const sendMessage = (message: string) => {
    const ev: CreateGuessEvent = {
      type: 'guess',
      message: message,
    }
    send(ev)
  }

  useEffect(() => {
    const unsubMessage = subscribe('guess', (data: GuessEvent) => {
      setMessages((prev) => [...prev, data])
    })

    const unsubPlayerJoined = subscribe('player_joined', (ev: PlayerJoined) => {
      const message: GuessEvent = {
        id: `system-login-${ev.id}`,
        type: 'guess',
        message: ev.message,
        correct: false,
        sender: ev.player,
      }
      setMessages((prev) => [...prev, message])
    })

    const unsubPlayerAbandoned = subscribe(
      'player_abandoned',
      (ev: PlayerAbandoned) => {
        const message: GuessEvent = {
          id: `system-${ev.id}`,
          type: 'guess',
          message: ev.message,
          correct: false,
          sender: ev.player,
        }
        setMessages((prev) => [...prev, message])
      },
    )

    const unsubClose = subscribe('close', (ev) => {
      if (ev.reason.length === 0) return

      const message: GuessEvent = {
        id: 'system-0',
        type: 'guess',
        message: ev.reason,
        correct: false,
        sender: sessionToUserWebSocket(session),
      }

      setMessages((prev) => [...prev, message])
    })

    return () => {
      unsubMessage()
      unsubClose()
      unsubPlayerAbandoned()
      unsubPlayerJoined()
    }

    /* eslint-disable react-hooks/exhaustive-deps */
    // session and subscribe are treated as invariants for the lifetime of this component.
    // If the session changes, the user is redirected and this component unmounts.
  }, [])

  return {
    messages,
    sendMessage,
  }
}
