import { useContext } from 'react'
import { GameStatusContext } from '../context/GameStatus/GameStatusContext'
import { CHAT_COLORS } from '../contants/chatColors'

export function TurnScores() {
  const { status } = useContext(GameStatusContext)

  return (
    <div>
      {status.state === 'end' && (
        <div className="max-w-xs flex flex-col items-center gap-8 p-8 rounded-4xl border-2 bg-background-50 dark:bg-background-900  border-background-200 dark:border-background-400 shadow-sm md:shadow-lg shadow-background-200 dark:shadow-background-400">
          <h2 className="text-4xl font-bold text-center">Turn Scores</h2>
          <ul className="text-lg w-full">
            {status.turn_scores.map((user) => (
              <li
                key={`${user.id}-${user.score}`}
                className="list-none w-full flex justify-between ">
                <p className={`mr-2 font-bold ${CHAT_COLORS[user.color]}`}>
                  {user.name}
                </p>
                <p className="text-accent-500 font-bold">+{user.score}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
