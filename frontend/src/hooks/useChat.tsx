import { useContext, useEffect, useState } from "react"
import { WebSocketContext, type GuessSocketEvent } from "../context/WebsSocketsContext"
import { SessionContext } from "../context/SessionContext"
import { useTimer } from "./useTimer"

export const useChat = () => {

  const { session } = useContext(SessionContext)
  const { subscribe, send } = useContext(WebSocketContext)

  const [messages, setMessages] = useState<GuessSocketEvent[]>([])

  const [status, setStatus] = useState("end")
  const { time, startTimer, cancelTimer } = useTimer()

  const sendMessage = (message: string) => {
    if (status === "guess" && (time === null || time === 0)) return;
    send({
      "type": "guess",
      "payload": {
        "message": message,
        "correct": false
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
          message: ev.reason,
          correct: false
        }
      }

      setMessages(prev => [...prev, message])
    })

    const unsubStatus = subscribe("status", (ev) => {
      if (ev.payload.status === "start") {
        setMessages([])
      }
      if (ev.payload.status === "guess") {
        startTimer(10)
      }
      if (ev.payload.status === "end") {
        cancelTimer()
      }
      setStatus(ev.payload.status)
    })

    return () => {
      unsubMessage()
      unsubClose()
      unsubStatus()
    }

  }, [])

  return {
    time,
    messages,
    sendMessage
  }

}
