import { useContext } from 'react'
import { GameStatusContext } from '../context/GameStatus/GameStatusContext'
import { CHAT_COLORS } from '../contants/chatColors'
import ReactConfetti from 'react-confetti'

export function GameEnded() {
  const { status } = useContext(GameStatusContext)

  const top3 = status.leaderboard.filter((_, i) => i < 3)

  const leaderboard = status.leaderboard.filter((_, i) => i >= 3)

  return (
    <div className="absolute top-0 -translate-1/2 overflow-hidden">
      {status.state === 'end' && status.leaderboard.length > 0 && (
        <div className="flex flex-col items-center p-8 rounded-4xl border-2 bg-background-50 dark:bg-background-900  border-background-200 dark:border-background-400 shadow-sm md:shadow-lg-lg shadow-background-200 dark:shadow-background-400">
          <ReactConfetti numberOfPieces={200} tweenDuration={1000} />
          <article className="flex flex-col items-center z-20">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-16 text-amber-500">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M17 3a1 1 0 0 1 .993 .883l.007 .117v2.17a3 3 0 1 1 0 5.659v.171a6.002 6.002 0 0 1 -5 5.917v2.083h3a1 1 0 0 1 .117 1.993l-.117 .007h-8a1 1 0 0 1 -.117 -1.993l.117 -.007h3v-2.083a6.002 6.002 0 0 1 -4.996 -5.692l-.004 -.225v-.171a3 3 0 0 1 -3.996 -2.653l-.003 -.176l.005 -.176a3 3 0 0 1 3.995 -2.654l-.001 -2.17a1 1 0 0 1 1 -1h10zm-12 5a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m14 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2" />
            </svg>
            <h2 className="text-5xl font-bold text-center">Game Over</h2>
            <p className="text-lg">
              <span className={CHAT_COLORS[status.leaderboard[0].color]}>
                {`${status.leaderboard[0].name} `}
              </span>
              is the winner!
            </p>
          </article>

          <article className="flex items-end gap-2 md:gap-8 mt-13 mb-8">
            {top3.length >= 2 && (
              <div
                className="flex flex-col justify-center items-center gap-2 relative 
                w-56 h-32 p-1 text-xl 
                bg-linear-0 from-20% 
                from-background-100 to-background-50 
                dark:from-background-800 dark:to-background-900 
                font-bold rounded-2xl border-2 
                border-slate-400 dark:border-slate-400 
                shadow-sm md:shadow-lg 
                shadow-slate-500 dark:shadow-slate-400
                text-slate-500 dark:text-slate-400
              ">
                <span className="absolute top-0 left-1/2 -translate-1/2 bg-slate-400 text-white grid place-content-center w-8 aspect-square rounded-full">
                  2
                </span>
                <span className="text-lg break-all text-center">
                  {top3[1].name}
                </span>
                <span className="text-3xl">{top3[1].score}</span>
              </div>
            )}

            <div
              className="flex flex-col justify-center items-center gap-2  relative
                w-56 h-38 p-2
                bg-linear-0 from-20% 
                from-background-100 to-background-50 
                dark:from-background-800 dark:to-background-900 
                font-bold rounded-2xl border-2 
                border-amber-200 dark:border-amber-400 
                shadow-sm md:shadow-lg 
                shadow-amber-200 dark:shadow-amber-500
                text-amber-500
              ">
              <span className="absolute top-0 left-1/2 -translate-1/2 text-text-950 bg-amber-500  grid place-content-center w-8 aspect-square rounded-full">
                1
              </span>
              <svg
                className="w-8 text-amber-500 absolute -top-8 left-1/2 -translate-1/2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4l4 -6" />
              </svg>
              <p className="text-lg break-all text-center min-w-0">
                {top3[0].name}
              </p>
              <span className="text-3xl">{top3[0].score}</span>
            </div>

            {top3.length >= 3 && (
              <div
                className="flex flex-col justify-center items-center gap-2 relative
                w-56 h-32 p-1 text-xl 
                bg-linear-0 from-20% 
                from-background-100 to-background-50 
                dark:from-background-800 dark:to-background-900 
                font-bold rounded-2xl border-2 
                border-orange-200 dark:border-orange-500 
                shadow-sm md:shadow-lg
                shadow-orange-200 dark:shadow-orange-600
                text-orange-500
              ">
                <span className="absolute top-0 left-1/2 -translate-1/2 bg-orange-500 text-white grid place-content-center w-8 aspect-square rounded-full">
                  3
                </span>
                <span className="text-lg">{top3[2].name}</span>
                <span className="text-3xl">{top3[2].score}</span>
              </div>
            )}
          </article>

          <ul className="text-lg w-full max-w-96 max-h-64 overflow-y-auto flex flex-col gap-2">
            {leaderboard.map((user, i) => (
              <li
                key={`${user.id}-${user.score}`}
                className="list-none w-full flex justify-between items-center px-4 py-1 bg-primary-800 rounded-xl">
                <p className="flex gap-6 font-bold">
                  <span>{i + 4}</span>
                  <span className={CHAT_COLORS[user.color]}>{user.name}</span>
                </p>
                <p className="shrink-0 text-background-400 font-bold">
                  {user.score}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
