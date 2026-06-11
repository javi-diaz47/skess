import { useContext, useEffect } from 'react'
import { useTimer } from '../hooks/useTimer'
import { Timer } from './Timer'
import { GameStatusContext } from '../context/GameStatus/GameStatusContext'
import { CHAT_COLORS } from '../contants/chatColors'
import { ONE_SECOND_IN_MILISECONDS } from '../contants/secondsToMiliseconds'
import { SessionContext } from '../context/session/SessionContext'

export function ChoosingWord() {
  const { status } = useContext(GameStatusContext)
  const { session } = useContext(SessionContext)

  const { time, startTimer, cancelTimer } = useTimer()

  useEffect(() => {
    if (
      status?.state === 'selection' &&
      status.timestamp &&
      status.word_selection_timer
    ) {
      const timestamp = new Date(status.timestamp * ONE_SECOND_IN_MILISECONDS)
      const now = new Date()

      const diff =
        (now.getTime() - timestamp.getTime()) / ONE_SECOND_IN_MILISECONDS

      const leftTime = Math.round(status.word_selection_timer - diff)

      if (leftTime > 0) {
        startTimer(leftTime)
      }
    }

    if (status?.state === 'guess') {
      cancelTimer()
    }
  }, [status, startTimer, cancelTimer])

  if (status.state === 'selection') {
    return (
      <div className="z-10 absolute top-0  -translate-1/2">
        {status.state === 'selection' &&
          status.sketcher?.id !== session?.id && (
            <div
              className="
              w-xl flex flex-col items-center gap-8 p-8 rounded-4xl border-2 
              border-background-200 dark:border-background-400 shadow-sm md:shadow-lg shadow-background-200 dark:shadow-background-400
              bg-linear-180 from-30%
              from-background-100 to-background-50 
              dark:from-background-800 dark:to-background-900 
            ">
              {!!status.sketcher && (
                <div className="flex flex-col justify-center items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 text-accent-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                    <path d="M13.5 6.5l4 4" />
                  </svg>
                  <h2 className="w-72 text-4xl font-bold text-center">
                    <span className={`${CHAT_COLORS[status.sketcher.color]}`}>
                      {`${status.sketcher.name} `}
                    </span>
                    is choosing a word...
                  </h2>
                </div>
              )}

              <Timer
                time={time}
                className="bg-background-100 dark:bg-background-800"
              />

              <p className="text-lg text-text-100">
                Everyone, get ready to{' '}
                <span className="text-accent-500">guess!</span>
              </p>
            </div>
          )}
      </div>
    )
  }

  return <></>
}
