import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { SessionContext } from '../session/SessionContext'
import { WebSocketContext } from './WebsSocketsContext'
import type { CreateSocketEvent, SocketEvents } from './types'

type SubscriberRegistry = {
  [K in keyof SocketEvents]: Set<(ev: SocketEvents[K]) => void>
}

const DEFAULT_SUBSCRIBER_REGISTRY: SubscriberRegistry = {
  player_joined: new Set(),
  player_abandoned: new Set(),

  game_started: new Set(),
  game_paused: new Set(),
  game_updated: new Set(),
  game_ended: new Set(),

  word_selection_started: new Set(),
  word_selected: new Set(),

  turn_ended: new Set(),
  round_ended: new Set(),

  guess: new Set(),
  hint_revealed: new Set(),

  sketch_path: new Set(),
  sketch: new Set(),

  leaderboard_updated: new Set(),

  close: new Set(),
}

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useContext(SessionContext)

  const ws = useRef<WebSocket | null>(null)

  const subscribers = useRef<SubscriberRegistry>(DEFAULT_SUBSCRIBER_REGISTRY)

  const subscribe = useCallback(
    <K extends keyof SocketEvents>(
      type: K,
      fn: (ev: SocketEvents[K]) => void,
    ) => {
      subscribers.current[type].add(fn)

      return () => {
        if (subscribers.current[type]) {
          subscribers.current[type].delete(fn)
        }
      }
    },
    [subscribers],
  )

  const onMessage = (ev: MessageEvent) => {
    const data = JSON.parse(ev.data)

    if (data.type === 'error') {
      console.error('[WebSocket]', 'Invalid message received', data)
      return
    }

    subscribers.current[data.type as keyof SubscriberRegistry].forEach((fn) =>
      fn(data),
    )
  }

  const onClose = (ev: CloseEvent) => {
    subscribers.current['close']?.forEach((fn) => fn(ev))
  }

  const send = useCallback((data: CreateSocketEvent) => {
    if (ws.current === null) return
    ws.current.send(JSON.stringify(data))
  }, [])

  useEffect(() => {
    if (session === null || ws.current !== null) return

    const URI = `ws://${import.meta.env.VITE_BACKEND_URL}/ws`
    ws.current = new WebSocket(
      `${URI}/${session.id}/${session.name}?room_id=${session.room_id}`,
    )

    ws.current.addEventListener('message', onMessage)
    ws.current.addEventListener('close', onClose)

    return () => {
      ws.current?.removeEventListener('message', onMessage)
      ws.current?.removeEventListener('close', onClose)
      ws.current?.close()
      ws.current = null
    }
  }, [session])

  return (
    <WebSocketContext.Provider
      value={{
        subscribe,
        send,
      }}>
      {children}
    </WebSocketContext.Provider>
  )
}
