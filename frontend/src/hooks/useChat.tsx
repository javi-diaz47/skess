import { useContext, useEffect, useState } from "react"
import { WebSocketContext, type GuessSocketEvent } from "../context/WebsSocketsContext"
import { SessionContext } from "../context/SessionContext"

export const useChat = () => {

  const { session } = useContext(SessionContext)
  const { subscribe, send } = useContext(WebSocketContext)

  const [messages, setMessages] = useState<GuessSocketEvent[]>([])

  const sendMessage = (message: string) => {
    send({
      "type": "guess",
      "payload": {
        "message": message
      }
    })
  }

  useEffect(() => {

    const unsubMessage = subscribe("guess", (data) => {
      setMessages(prev => [...prev, data])
    })

    const unsubClose = subscribe("close", (ev) => {
      if (ev.reason.length === 0) return;

      const message: GuessSocketEvent = {
        event_id: "0",
        user: session,
        type: "guess",
        payload: {
          message: ev.reason
        }
      }

      setMessages(prev => [...prev, message])
    })

    return () => {
      unsubMessage()
      unsubClose()
    }

  }, [])

  return {
    messages,
    sendMessage
  }

}
