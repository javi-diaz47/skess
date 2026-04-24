import { useContext, useEffect, useState } from "react"
import { WebSocketContext } from "../context/WebsSocketsContext"

export function WordSelector() {
  const [choose, setChoose] = useState([])
  const { subscribe, send } = useContext(WebSocketContext)

  const onChooseWord = (word: string) => {
    send({
      type: "choose_selection",
      payload: {
        word
      }
    })
    setChoose([])
  }


  useEffect(() => {
    const unsubChoose = subscribe("choose_options", (ev) => {
      setChoose(() => ev.payload.words)
    })

    return () => {
      unsubChoose()
    }
  }, [])


  return (
    <div>
      {
        choose && choose.length == 3 && (
          <div className="flex gap-6">
            {
              choose.map((word, i) => (
                <button
                  key={`${word}-${i}`}
                  onClick={() => onChooseWord(word)}
                  className="w-32 h-32 bg-background-600 font-bold cursor-pointer"
                >
                  {word}
                </button>
              ))
            }
          </div>
        )
      }
    </div>
  )
}
