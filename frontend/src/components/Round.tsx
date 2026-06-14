import { useContext } from 'react'
import { GameStatusContext } from '../context/GameStatus/GameStatusContext'

export function Round() {
  const { status } = useContext(GameStatusContext)

  const getDotColor = (index: number): string => {
    if (!status.round) return ''
    if (index + 1 === status.round) return 'to-accent bg-primary-500'
    if (index + 1 === status.round - 1) return 'to-primary bg-accent-500'
    return 'bg-primary-500'
  }

  if (status.state === 'round_end') {
    return (
      <div className="z-10 absolute top-0 -translate-1/2">
        <div
          className="
              w-xs h-96 flex flex-col items-center justify-around gap-8 p-8 rounded-4xl border-2 
              border-background-200 dark:border-background-400 shadow-sm md:shadow-lg shadow-background-200 dark:shadow-background-400
              bg-linear-180 from-30%
              from-background-100 to-background-50 
              dark:from-background-800 dark:to-background-900 
        ">
          <div className="flex flex-col justify-center items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-12 text-accent-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 5h2" />
              <path d="M5 4v2" />
              <path d="M11.5 4l-.5 2" />
              <path d="M18 5h2" />
              <path d="M19 4v2" />
              <path d="M15 9l-1 1" />
              <path d="M18 13l2 -.5" />
              <path d="M18 19h2" />
              <path d="M19 18v2" />
              <path d="M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39" />
            </svg>
            <h2 className="text-4xl font-bold text-center flex flex-col">
              <span>
                Round {status.round}/{status.max_rounds}
              </span>
              <span>is starting!</span>
            </h2>
          </div>
          <p className="text-lg text-text-100">Get ready for a new word</p>
          <div className="flex gap-4">
            {Array(status.max_rounds)
              .fill(0)
              .map((_, i) => (
                <div className={`${getDotColor(i)} w-4 h-4 rounded-full`}></div>
              ))}
          </div>
        </div>
      </div>
    )
  }
  return <></>
}
