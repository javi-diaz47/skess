import { useContext, useEffect, useState } from "react"
import { SessionContext } from "./context/SessionContext"
import { Chat } from "./components/Chat";
import { SketchBoard } from "./components/SketchBoard"
import { WebSocketContext } from "./context/WebsSocketsContext";

export function Home() {

  const { session, onDeleteSession } = useContext(SessionContext)

  const [choose, setChoose] = useState([])
  const { subscribe, send } = useContext(WebSocketContext)

  const onChooseWord = (word: string) => {
    send({
      type: "choose_selection",
      payload: {
        word
      }
    })
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
      <h2>Home</h2>
      <p>{session.id}</p>
      <p>{session.name}</p>
      <button onClick={onDeleteSession}>
        Close session
      </button>
      <Chat />
      {
        choose && choose.length == 3 && (
          <div className="flex gap-6">
            {
              choose.map(word => (
                <button
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
      <SketchBoard />
    </div>
  )
}
