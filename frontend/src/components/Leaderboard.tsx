import { useContext, useEffect, useState } from "react"
import { WebSocketContext, type UserAPI } from "../context/WebsSocketsContext"
import { CHAT_COLORS } from "../contants/chatColors"

export function Leaderboard() {
  const { subscribe } = useContext(WebSocketContext)
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
    <div className="flex flex-col h-full">
      <h2 className="shrink-0 text-2xl font-bold">Leaderboard</h2>
      <ul className="flex-1 bg-background-100 dark:bg-background-900 overflow-y-scroll p-2 rounded-2xl">
        {
          leaderboard && leaderboard.map(user => (
            <li className="flex justify-between py-1 px-2">
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
    </div>
  )
}
