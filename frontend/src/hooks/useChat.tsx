import { useContext, useEffect, useState } from "react"
import { WebSocketContext, type GuessSocketEvent } from "../context/WebsSocketsContext"
import { SessionContext } from "../context/SessionContext"
import { useTimer } from "./useTimer"
import { ONE_SECOND_IN_MILISECONDS } from "../contants/secondsToMiliseconds"

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
          correct: false,
        },
        timestamp: 0,
        game_guess_limit: 0
      }

      setMessages(prev => [...prev, message])
    })

    const unsubStatus = subscribe("status", (ev) => {
      if (ev.payload.status === "start") {
        setMessages([])
      }
      if (ev.payload.status === "guess") {
        const timestamp = new Date(ev.timestamp * ONE_SECOND_IN_MILISECONDS)
        const now = new Date()

        const diff = (now.getTime() - timestamp.getTime()) / ONE_SECOND_IN_MILISECONDS

        const leftTime = Math.round(ev.game_guess_limit - diff)

        if (leftTime > 0) {
          startTimer(leftTime)
        }
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
