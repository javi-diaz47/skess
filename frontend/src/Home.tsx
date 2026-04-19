import { useContext, useRef, type SubmitEvent } from "react"
import { SessionContext } from "./context/SessionContext"
import { WebsocketContext } from "./context/Websockets";
import { Chat } from "./components/Chat";


export function Home() {

  const { session, onDeleteSession } = useContext(SessionContext)
  const { messages, onSendMessage } = useContext(WebsocketContext);

  const input = useRef<HTMLInputElement>(null)
  const onSubmit = (ev: SubmitEvent<HTMLFormElement>) => {
    ev.preventDefault()

    if (input.current.value.length === 0) return;

    onSendMessage({
      "type": "guess",
      "payload": {
        "message": input.current.value
      }
    })

    input.current.value = ""
  }


  return (
    <div>
      <h2>Home</h2>
      <p>{session.id}</p>
      <p>{session.name}</p>
      <button onClick={onDeleteSession}>
        Close session
      </button>
      <Chat messages={messages} />
      <form onSubmit={onSubmit}>
        <input ref={input} maxLength={40} name="guess" type="text" placeholder="Type your guess" />
        <button>
          send
        </button>
      </form>
    </div >
  )
}
