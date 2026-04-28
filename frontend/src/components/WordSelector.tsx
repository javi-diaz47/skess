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
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-center">{time}</h2>
            <div className="flex gap-6">
              {
                choose.map((word, i) => (
                  <button
                    key={`${word}-${i}`}
                    onClick={() => onChooseWord(word)}
                    className="w-32 h-32 bg-background-600 font-bold cursor-pointer hover:scale-110 active:scale-100 duration-100"
                  >
                    {word}
                  </button>
                ))
              }
            </div>
          </div>
        )
      }
    </div>
  )
}
