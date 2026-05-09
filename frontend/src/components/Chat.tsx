import { useContext, useState, type SubmitEvent } from "react";
import { SessionContext } from "../context/SessionContext";
import { CHAT_COLORS } from "../contants/chatColors";
import { useChat } from "../hooks/useChat";




export function Chat() {

  const { session } = useContext(SessionContext)
  const { time, messages, sendMessage } = useChat()

  const [input, setInput] = useState("")

  const onSubmit = (ev: SubmitEvent<HTMLFormElement>) => {
    ev.preventDefault()

    if (input.length === 0) return;

    sendMessage(input)

    setInput("")
  }

  const countAlpha = (word: string): number => {
    let counter = 0
    for (let i = 0; i < word.length; i++) {
      const code = word.charCodeAt(i)
      if (code > 47 && code < 58 || code > 96 && code < 123) counter++
    }
    return counter
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="shrink-0 text-2xl font-bold">Chat {time}</h2>
      <ul className="flex-1 h-full min-h-72 bg-background-100 dark:bg-background-900 overflow-y-scroll p-2 rounded-2xl">
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

      <form onSubmit={onSubmit} className="shrink-0 flex items-center justify-between gap-2 mt-4">
        <div className="w-full flex items-center justify-around bg-background-100 dark:bg-background-900 text-text-800 dark:text-text-100 rounded-full p-4">
          <input
            value={input}
            onChange={(ev) => setInput(ev.target.value)}
            maxLength={40}
            name="guess"
            type="text"
            placeholder="Type your guess..."
            className=" dark:text-text-50 dark:placeholder:text-text-300 outline-none"
          />
          {
            input.length === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-keyboard"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20 5a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-16a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3zm-14 8a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m12 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m-7.998 0a1 1 0 0 0 -.004 2l4 .01a1 1 0 0 0 .005 -2zm-4.002 -4a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1" /></svg>
            ) : (
              <span>{countAlpha(input)}</span>
            )
          }
        </div>
        <button className="bg-primary-500 dark:bg-primary-700 p-4 rounded-full text-text-50 hover:scale-110 active:scale-100 duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-send"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M21.864 3.549l-6.454 17.868a1.55 1.55 0 0 1 -1.41 .903a1.54 1.54 0 0 1 -1.394 -.874l-2.88 -5.759zm-1.414 -1.414l-12.139 12.138l-5.728 -2.864a1.55 1.55 0 0 1 -.903 -1.409c0 -.606 .353 -1.157 .981 -1.44z" /></svg>
        </button>
      </form>

    </div>
  )
}
