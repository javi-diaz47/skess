import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SessionContext } from "./SessionContext";


type BaseSocketEvent<T, U> = {
  event_id: string
  type: T
  payload: U
  user_id: string
}

export type GuessSocketEvent = BaseSocketEvent<"guess", { message: string }>

export type CreateGuessSocketEvent = Omit<GuessSocketEvent, "event_id">


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

  useEffect(() => {

    if (!hasSession() || ws.current !== null) return;

    const URI = "ws://127.0.0.1:8000/ws"
    ws.current = new WebSocket(`${URI}/${session.id}`)

    ws.current.addEventListener("message", onMessage)

    return () => {
      ws.current.removeEventListener("message", onMessage)
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
