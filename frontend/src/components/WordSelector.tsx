import { useContext, useEffect, useState } from 'react'
import { WebSocketContext } from '../context/WebSockets/WebsSocketsContext'
import { useTimer } from '../hooks/useTimer'
import { Timer } from './Timer'
import type {
  CreateSelectWord,
  WordSelectionStarted,
} from '../context/WebSockets/types'

export function WordSelector() {
  const [choose, setChoose] = useState<string[]>([])
  const { subscribe, send } = useContext(WebSocketContext)

  const automaticChooseWord = () => {
    const newEv: CreateSelectWord = {
      type: 'select_word',
      word: choose[0],
    }
    send(newEv)

    setChoose([])
  }

  const { time, startTimer, cancelTimer } = useTimer({
    onEndCallback: automaticChooseWord,
  })

  const onChooseWord = (word: string) => {
    const newEv: CreateSelectWord = {
      type: 'select_word',
      word,
    }
    send(newEv)

    cancelTimer()
    setChoose([])
  }

  useEffect(() => {
    const unsubChoose = subscribe(
      'word_selection_started',
      (ev: WordSelectionStarted) => {
        setChoose(() => ev.words)
        startTimer(ev.timer)
      },
    )

    const unsubGamePaused = subscribe('game_paused', () => {
      setChoose([])
    })

    return () => {
      unsubChoose()
      unsubGamePaused()
    }
  }, [subscribe, startTimer])

  return (
    <div>
      {choose && choose.length == 3 && (
        <div className="flex flex-col items-center gap-8 p-8 rounded-4xl border-2 bg-background-50 dark:bg-background-900  border-background-200 dark:border-background-400 shadow-sm md:shadow-lg shadow-background-200 dark:shadow-background-400">
          <h2 className="text-4xl font-bold text-center">Choose a word</h2>

          <Timer
            time={time}
            className="bg-background-100 dark:bg-background-800"
          />

          <div className="flex flex-col gap-2 md:flex-row md:gap-8">
            {choose.map((word, i) => (
              <button
                key={`${word}-${i}`}
                onClick={() => onChooseWord(word)}
                className="min-w-42 h-12 md:h-48 text-xl first-letter:capitalize bg-linear-0 from-20% from-background-100 to-background-50 dark:from-background-800 dark:to-background-900 font-bold cursor-pointer hover:scale-125 active:scale-100 duration-125 rounded-2xl border-2 border-background-200 dark:border-background-400 shadow-sm md:shadow-lg shadow-background-200 dark:shadow-background-500">
                {word}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
