import { useContext, useEffect, useState } from "react"
import { WebSocketContext } from "../context/WebsSocketsContext"

export function PlayButton() {

  const [status, setStatus] = useState("")
  const { send, subscribe } = useContext(WebSocketContext)

  const onPlay = () => {
    send({
      type: "status",
      payload: {
        status: "start"
      }
    })
  }

  useEffect(() => {
    const unsubStatus = subscribe("status", (ev) => {
      setStatus(ev.payload.status)
    })
    return () => {
      unsubStatus()
    }
  }, [])

  return (
    <button
      onClick={onPlay}
      disabled={status !== "end"}
      className="p-4 font-bold bg-accent-600 cursor-pointer hover:scale-110 transition-transform active:scale-100 disabled:hover:scale-100 disabled:bg-accent-800">
      Play
    </button>
  )
}
