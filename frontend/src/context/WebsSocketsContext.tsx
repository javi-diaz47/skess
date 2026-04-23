import { createContext, useContext, useEffect, useRef } from "react";
import { SessionContext, type UserSession } from "./SessionContext";

export type SocketEventError = {
  error: string
  message: string
}

type BaseSocketEvent<T, U> = {
  event_id: string
  type: T
  payload: U
  user: UserSession
}

type CreateSocketEvent<SocketEvent> = Omit<SocketEvent, "event_id" | "user">

export type GuessSocketEvent = BaseSocketEvent<"guess", { message: string }>
export type CreateGuessSocketEvent = CreateSocketEvent<GuessSocketEvent>

export type SketchSocketEvent = BaseSocketEvent<"sketch", { path: string, color: string, sketching: boolean }>
export type CreateSketchSocketEvent = CreateSocketEvent<SketchSocketEvent>

export type ChooseSocketEvent = BaseSocketEvent<"choose_options", { words: string[] }>
export type CreateChooseSelectionSocketEvent = CreateSocketEvent<BaseSocketEvent<"choose_selection", { word: string }>>


export interface WebsocketSession {
  messages: GuessSocketEvent[]
  sketch: SketchSocketEvent[]
  onSendMessage: (message: CreateGuessSocketEvent | CreateSketchSocketEvent) => void

}

export type SocketEvents = {
  guess: GuessSocketEvent,
  choose_options: ChooseSocketEvent,
  sketch: SketchSocketEvent,
  close: CloseEvent
}


export type WebSocketContextValue = {
  subscribe: <K extends keyof SocketEvents>(
    type: K,
    fn: (ev: SocketEvents[K]) => void
  ) => () => void

  send: (ev: CreateGuessSocketEvent | CreateSketchSocketEvent | CreateChooseSelectionSocketEvent) => void

}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null)

export const WebSocketProvider = ({ children }) => {

  const { session, hasSession } = useContext(SessionContext)

  const ws = useRef<WebSocket | null>(null)

  const subscribers = useRef<Record<string, Function[]>>({})

  const subscribe = <K extends keyof SocketEvents>(type: K, fn: Function) => {
    if (!subscribers.current[type]) {
      subscribers.current[type] = []
    }

    subscribers.current[type].push(fn)

    return () => {
      subscribers.current[type] = subscribers.current[type].filter(f => f !== fn)
    }

  }

  const onMessage = (ev: MessageEvent) => {
    const data = JSON.parse(ev.data)
    subscribers.current[data.type]?.forEach(fn => fn(data))
  }

  const onClose = (ev: CloseEvent) => {
    subscribers.current["close"]?.forEach(fn => fn(ev))
  }

  const send = (data: any) => {
    if (ws.current === null) return;
    ws.current.send(JSON.stringify(data))
  }

  useEffect(() => {

    if (!hasSession() || ws.current !== null) return;

    const URI = "ws://127.0.0.1:8000/ws"
    ws.current = new WebSocket(`${URI}/${session.id}/${session.name}`)

    ws.current.addEventListener("message", onMessage)
    ws.current.addEventListener("close", onClose)

    return () => {
      ws.current.removeEventListener("message", onMessage)
      ws.current.removeEventListener("close", onClose)
      ws.current.close()
      ws.current = null
    }

  }, [session])

  return (
    <WebSocketContext.Provider value={{
      subscribe,
      send
    }}>
      {children}
    </WebSocketContext.Provider>
  )

}
