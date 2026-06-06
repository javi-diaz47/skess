import { useContext, useEffect, useState } from 'react'
import {
  WebSocketContext,
  type LeaderboardUpdated,
  type UserAPI,
  type UserWebSocket,
} from '../context/WebSockets/WebsSocketsContext'
import { CHAT_COLORS } from '../contants/chatColors'
import { SessionContext } from '../context/SessionContext'

export function Leaderboard() {
  const { session } = useContext(SessionContext)
  const { subscribe } = useContext(WebSocketContext)

  const [leaderboard, setLeaderboard] = useState<UserWebSocket[]>([])

  useEffect(() => {
    const unsubLeaderboard = subscribe(
      'leaderboard_updated',
      (ev: LeaderboardUpdated) => {
        setLeaderboard(ev.leaderboard)
      },
    )

    return () => {
      unsubLeaderboard()
    }
  }, [])

  const topLeadersColors = (position: number) => {
    if (position == 1) return 'bg-amber-500 text-text-950'
    if (position == 2) return 'bg-slate-500 text-text-50'
    if (position == 3) return 'bg-accent-500 text-text-50'

    return 'bg-background-800 text-text-300'
  }

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      <div className="flex-1 bg-background-100 dark:bg-background-900 overflow-y-scroll p-2 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-accent-500"
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4l4 -6" />
          </svg>
          <h2 className="md:text-2xl font-bold text-text-400 dark:text-text-200">
            Leaderboard
          </h2>
        </div>

        <ul className="text-sm md:text-base">
          {leaderboard &&
            leaderboard.map((user, i) => (
              <li className="flex items-center justify-between p-2">
                <div
                  className={`mr-2 font-bold ${CHAT_COLORS[user.color]} flex gap-2 items-center`}>
                  <div
                    className={`${topLeadersColors(i + 1)} rounded-full w-6 h-6 flex justify-center items-center`}>
                    {i + 1}
                  </div>
                  <span
                    className={`${session.id === user.id ? 'text-accent-400' : ''}`}>
                    {user.name}
                  </span>
                </div>
                <span
                  className={`${session.id === user.id ? 'text-accent-400' : ''}`}>
                  {user.score}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
