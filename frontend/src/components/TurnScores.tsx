import { useContext } from 'react'
import { GameStatusContext } from '../context/GameStatus/GameStatusContext'
import { CHAT_COLORS } from '../contants/chatColors'

export function TurnScores() {
  const { status } = useContext(GameStatusContext)

  return (
    <div className="absolute top-0 -translate-1/2 min-w-72 max-w-96">
      {status.state === 'turn_end' && status.turn_scores.length > 0 && (
        <div
          className="
          flex flex-col items-center gap-8 p-8 rounded-4xl border-2 
          border-background-200 dark:border-background-400 shadow-sm md:shadow-lg shadow-background-200 dark:shadow-background-400
          bg-linear-180 from-1%
          from-background-100 to-background-50 
          dark:from-background-800 dark:to-background-900 
        ">
          <h2 className="text-4xl font-bold text-center">Turn Scores</h2>
          <ul className="text-lg w-full overflow-y-auto max-h-96">
            {status.turn_scores.map((user) => (
              <li
                key={`${user.id}-${user.score}`}
                className="list-none w-full flex justify-between items-center">
                <p
                  className={`mr-2 min-w-0 wrap-break-word font-bold ${CHAT_COLORS[user.color]}`}>
                  {user.name}
                </p>
                <p
                  className={`shrink-0 ${user.score > 0 ? 'text-green-500' : 'text-accent-500'} font-bold`}>
                  +{user.score}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
