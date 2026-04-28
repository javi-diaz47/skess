import { useContext, useRef, type SubmitEvent } from "react";
import { SessionContext } from "../context/SessionContext";
import { CHAT_COLORS } from "../contants/chatColors";
import { useChat } from "../hooks/useChat";




export function Chat() {

  const { session } = useContext(SessionContext)
  const { time, messages, sendMessage } = useChat()

  const input = useRef<HTMLInputElement>(null)

  const onSubmit = (ev: SubmitEvent<HTMLFormElement>) => {
    ev.preventDefault()

    if (input.current.value.length === 0) return;

    sendMessage(input.current.value)

    input.current.value = ""
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Chat {time}</h2>
      <ul className="h-72 w-72 bg-background-100 dark:bg-background-900 overflow-y-scroll p-2">
        {
          messages && messages.map(item => (
            item.payload.correct ? (
              <li className="bg-green-950">
                <p className="break-all">
                  <span className={`mr-2 font-bold ${CHAT_COLORS[item.user.color]}`}>
                    {item.user.name}:
                  </span>
                  guessed correctly
                </p>
              </li>
            ) : (
              <li key={item.event_id} className={`${item.payload.correct === true ? "bg-green-700" : ""}`}>
                <p className="break-all">
                  <span className={`mr-2 font-bold ${CHAT_COLORS[item.user.color]}`}>
                    {item.user.id === session.id ? 'You' : item.user.name}:
                  </span>
                  {item.payload.message}
                </p>
              </li>
            )
          ))
        }
      </ul>

      <form onSubmit={onSubmit}>
        <input ref={input} maxLength={40} name="guess" type="text" placeholder="Type your guess" />
        <button>
          send
        </button>
      </form>

    </div>
  )
}
