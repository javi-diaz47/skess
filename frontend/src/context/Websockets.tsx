import { createContext, useContext, useEffect, useRef, type Ref } from "react";
import { SessionContext } from "./SessionContext";

export interface WebsocketSession {
  ws: Ref<WebSocket | null>
}

export const WebsocketContext = createContext<WebsocketSession | null>(null)

export const WebsocketProvider = ({ children }) => {

  const { session, hasSession } = useContext(SessionContext)
  const ws = useRef<WebSocket | null>(null)


  const onMessage = (ev: MessageEvent<any>) => {
    ev.preventDefault()
    console.log(ev.data)
  }


  useEffect(() => {

    if (!hasSession()) return;

    const URI = "ws://127.0.0.1:8000/ws"
    ws.current = new WebSocket(`${URI}/${session.id}`)

    ws.current.addEventListener("message", onMessage)

    return () => {
      ws.current.removeEventListener("message", onMessage)
    }


  }, [session])

  return (
    <WebsocketContext.Provider value={{
      ws
    }}>
      {children}
    </WebsocketContext.Provider>
  )

}
