import { useContext, useEffect, useRef, type ReactNode } from 'react'
import { SessionContext } from '../session/SessionContext'
import type {
  CreateGuessEvent,
  CreateSelectWord,
  CreateSketchEvent,
  GamePaused,
  GameStarted,
  GameUpdated,
  GuessEvent,
  HintRevealed,
  LeaderboardUpdated,
  PlayerAbandoned,
  SketchEvent,
  TurnEnded,
  WordSelected,
  WordSelectionStarted,
} from './types'
import { WebSocketContext } from './WebsSocketsContext'

export type SocketEvents = {
  guess: GuessEvent
  game_paused: GamePaused
  game_started: GameStarted
  game_updated: GameUpdated
  leaderboard_updated: LeaderboardUpdated
  turn_ended: TurnEnded
  hint_revealed: HintRevealed
  word_selected: WordSelected
  word_selection_started: WordSelectionStarted
  player_abandoned: PlayerAbandoned
  sketch: SketchEvent
  close: CloseEvent
}

export type CreateSocketEvent =
  | CreateGuessEvent
  | CreateSketchEvent
  | CreateSelectWord

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { session, hasSession } = useContext(SessionContext)

  const ws = useRef<WebSocket | null>(null)

  const subscribers = useRef<Record<string, Function[]>>({})

  const subscribe = <K extends keyof SocketEvents>(type: K, fn: Function) => {
    if (!subscribers.current[type]) {
      subscribers.current[type] = []
    }

    subscribers.current[type].push(fn)

    return () => {
      subscribers.current[type] = subscribers.current[type].filter(
        (f) => f !== fn,
      )
    }
  }

  const onMessage = (ev: MessageEvent) => {
    const data = JSON.parse(ev.data)

    if (data.type === 'error') {
      console.error('[WebSocket]', 'Invalid message received', data)
      return
    }
    console.log(data)

    subscribers.current[data.type]?.forEach((fn) => fn(data))
  }

  const onClose = (ev: CloseEvent) => {
    subscribers.current['close']?.forEach((fn) => fn(ev))
  }

  const send = (data: CreateSocketEvent) => {
    if (ws.current === null) return
    ws.current.send(JSON.stringify(data))
  }

  useEffect(() => {
    if (!hasSession() || ws.current !== null) return

    const URI = 'ws://127.0.0.1:8000/ws'
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
