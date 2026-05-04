import { useContext, useEffect, useState } from "react"
import { WebSocketContext } from "../context/WebsSocketsContext"
import { useTimer } from "../hooks/useTimer"

export function WordSelector() {
  const [choose, setChoose] = useState([])
  const { subscribe, send } = useContext(WebSocketContext)

  const automaticChooseWord = () => {
    send({
      type: "choose_selection",
      payload: {
        word: choose[0]
      }
    })
    setChoose([])

  }

  const { time, startTimer, cancelTimer } = useTimer({ onEndCallback: automaticChooseWord })

  const onChooseWord = (word: string) => {
    send({
      type: "choose_selection",
      payload: {
        word
      }
    })
    cancelTimer()
    setChoose([])
  }


  useEffect(() => {
    const unsubChoose = subscribe("choose_options", (ev) => {
      setChoose(() => ev.payload.words)
      startTimer(10)
    })

    return () => {
      unsubChoose()
    }
  }, [])


  return (
    <div>
      {
        choose && choose.length == 3 && (
          <div className="flex flex-col items-center gap-8 p-8 bg-background-900 rounded-4xl border-2 border-background-400 shadow-sm shadow-background-400">
            <h2 className="text-4xl font-bold text-center">Choose a word</h2>
            <div className="flex items-center justify-center w-fit py-2 px-8 gap-6 bg-background-800 rounded-full text-accent-500">
              <svg
                width={36}
                height={36}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-stopwatch"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 13a7 7 0 1 0 14 0a7 7 0 0 0 -14 0" />
                <path d="M14.5 10.5l-2.5 2.5" />
                <path d="M17 8l1 -1" />
                <path d="M14 3h-4" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs text-background-300 uppercase font-bold">Time left</span>
                <p className={`${time <= 5 ? "text-accent-400" : "text-background-50"} text-2xl font-bold`}>
                  {time}
                  <span className="text-xs">S</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:gap-8">
              {
                choose.map((word, i) => (
                  <button
                    key={`${word}-${i}`}
                    onClick={() => onChooseWord(word)}
                    className="min-w-42 h-12 md:h-48 text-xl first-letter:capitalize bg-linear-0 from-20% from-background-800 to-background-900 font-bold cursor-pointer hover:scale-125 active:scale-100 duration-125 rounded-2xl border-2 border-background-400 shadow-sm md:shadow-lg shadow-background-500"
                  >
                    {word}
                  </button>
                ))
              }
            </div>
          </div>
        )
      }
    </div >
  )
}
