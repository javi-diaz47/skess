import { createContext, useContext, useEffect, useRef, useState } from "react";
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


export interface WebsocketSession {
  messages: GuessSocketEvent[]
  onSendMessage: (message: CreateGuessSocketEvent) => void
}

export const WebsocketContext = createContext<WebsocketSession | null>(null)

export const WebsocketProvider = ({ children }) => {

  const { session, hasSession } = useContext(SessionContext)
  const [messages, setMessages] = useState<GuessSocketEvent[]>([])

  const ws = useRef<WebSocket | null>(null)

  const onMessage = (ev: MessageEvent<any>) => {
    const data = JSON.parse(ev.data)

    if (data.type === "guess") {
      setMessages(prev => [...prev, data])
    }

  }

  const onSendMessage = (message: CreateGuessSocketEvent) => {
    if (ws.current === null) return;
    ws.current.send(JSON.stringify(message))
  }

  const onClose = (ev: CloseEvent) => {

    const message: GuessSocketEvent = {
      event_id: "0",
      user: session,
      type: "guess",
      payload: {
        message: ev.reason
      }
    }

    setMessages(prev => [...prev, message])
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
    <WebsocketContext.Provider value={{
      messages,
      onSendMessage
    }}>
      {children}
    </WebsocketContext.Provider>
  )

}
