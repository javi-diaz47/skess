import { useContext, useEffect, useRef } from 'react'
import { useTimer } from '../hooks/useTimer'
import { ONE_SECOND_IN_MILISECONDS } from '../contants/secondsToMiliseconds'
import { Timer } from './Timer'
import { GameStatusContext } from '../context/GameStatus/GameStatusContext'
import { CHAT_COLORS } from '../contants/chatColors'
import { LoaderAnimation } from './LoaderAnimation'

export function StatusBar() {
  const { time, startTimer, cancelTimer } = useTimer()

  const { status } = useContext(GameStatusContext)

  const timerAudio = useRef<HTMLAudioElement>(null)

  const stopTimerAudio = () => {
    timerAudio.current?.pause()
    if (timerAudio.current) {
      timerAudio.current.currentTime = 0
    }
  }

  useEffect(() => {
    timerAudio.current = new Audio('/sounds/timer.mp3')
  }, [])

  useEffect(() => {
    if (time === 4) {
      timerAudio.current?.play()
    }
  }, [time])

  useEffect(() => {
    if (status?.state === 'guess' && status.timestamp && status.guess_limit) {
      const timestamp = new Date(status.timestamp * ONE_SECOND_IN_MILISECONDS)
      const now = new Date()

      const diff =
        (now.getTime() - timestamp.getTime()) / ONE_SECOND_IN_MILISECONDS

      const leftTime = Math.round(status.guess_limit - diff)

      if (leftTime > 0) {
        startTimer(leftTime)
      }
    }

    if (status?.state === 'turn_end' || status?.state === 'end') {
      cancelTimer()
      stopTimerAudio()
    }
  }, [status, startTimer, cancelTimer])

  return (
    <section className="flex text-sm md:text-base text-text-900 dark:text-text-50 justify-between md:justify-center items-center gap-2 md:gap-8">
      <div className="min-w-19 md:h-16 flex gap-2 justify-center items-center text-sm md:text-base font-bold bg-background-100 dark:bg-background-900 rounded-full py-2 md:py-4 px-4 md:px-8">
        <p>
          {status?.round || 0}/{status?.max_rounds || 0}
        </p>
        <p className="hidden md:block">Rounds</p>
      </div>

      {status?.state === 'pause' && (
        <div className="md:h-16 flex justify-center items-center gap-6 md:gap-4 font-bold bg-background-100 dark:bg-background-900 rounded-full py-2 md:py-4 px-4 md:px-8">
          <p className="shimmer-text fot-bold italic">
            Waiting for players to join
          </p>
          <LoaderAnimation className="w-12 stroke-accent-500" />
        </div>
      )}

      {status?.hint && status?.state !== 'pause' && (
        <div className="md:h-16 flex justify-center gap-1 md:gap-4 md:text-2xl font-bold bg-background-100 dark:bg-background-900 rounded-full py-2 md:py-4 px-4 md:px-8">
          <p>
            {status?.hint.split('').map((ch, i) => (
              <span key={`${i}-${ch}`} className="mr-1 md:mr-2">
                {ch}
              </span>
            ))}
          </p>
          <span className="self-end text-xs md:text-base">
            {status?.word_letter_count}
          </span>
        </div>
      )}

      <Timer time={time} className="" />

      {status?.sketcher && status?.state !== 'pause' && (
        <p className="hidden break-all md:flex items-center max-w-72 h-16 text-sm md:text-base bg-background-100 dark:bg-background-900 rounded-full py-4 px-8">
          <span
            className={`mr-2 font-bold ${CHAT_COLORS[status?.sketcher?.color]}`}>
            {status?.sketcher?.name}
          </span>
          {status.state === 'start' ? 'is choosing a word' : 'is sketching!'}
        </p>
      )}
    </section>
  )
}
