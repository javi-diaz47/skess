import { useContext, useEffect, useState } from "react"
import { WebSocketContext, type UserAPI } from "../context/WebsSocketsContext"
import { CHAT_COLORS } from "../contants/chatColors"

export function Leaderboard() {
  const { subscribe, send } = useContext(WebSocketContext)
  const [leaderboard, setLeaderboard] = useState<UserAPI[]>([])

  useEffect(() => {
    const unsubLeaderboard = subscribe("leaderboard", (ev) => {
      setLeaderboard(ev.payload.leaderboard)
    })

    return () => {
      unsubLeaderboard()
    }

  }, [])


  return (
    <ul>
      <h2 className="text-2xl font-bold">Leaderboard</h2>
      {
        leaderboard && leaderboard.map(user => (
          <li>
            <span className={`mr-2 font-bold ${CHAT_COLORS[user.color]}`}>

              {user.name}
            </span>
            <span>
              {user.score}
            </span>
          </li>
        ))
      }
    </ul>
  )
}
