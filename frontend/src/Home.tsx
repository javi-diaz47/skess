import { useContext, useRef, type SubmitEvent } from "react"
import { SessionContext } from "./context/SessionContext"
import { WebsocketContext } from "./context/Websockets";

export const colors: Record<string, string> = {
  red: "text-red-600 dark:text-red-400",
  orange: "text-orange-600 dark:text-orange-400",
  amber: "text-amber-600 dark:text-amber-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  lime: "text-lime-600 dark:text-lime-400",
  green: "text-green-600 dark:text-green-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  teal: "text-teal-600 dark:text-teal-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  sky: "text-sky-600 dark:text-sky-400",
  blue: "text-blue-600 dark:text-blue-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
  violet: "text-violet-600 dark:text-violet-400",
  purple: "text-purple-600 dark:text-purple-400",
  fuchsia: "text-fuchsia-600 dark:text-fuchsia-400",
  pink: "text-pink-600 dark:text-pink-400",
  rose: "text-rose-600 dark:text-rose-400",
  slate: "text-slate-600 dark:text-slate-400",
  gray: "text-gray-600 dark:text-gray-400",
  zinc: "text-zinc-600 dark:text-zinc-400",
  neutral: "text-neutral-600 dark:text-neutral-400",
  stone: "text-stone-600 dark:text-stone-400",
  taupe: "text-taupe-600 dark:text-taupe-400",
  mauve: "text-mauve-600 dark:text-mauve-400",
  mist: "text-mist-600 dark:text-mist-400",
  olive: "text-olive-600 dark:text-olive-400",
};


export function Home() {

  const { session, onDeleteSession } = useContext(SessionContext)
  const { messages, onSendMessage } = useContext(WebsocketContext);

  const input = useRef<HTMLInputElement>(null)
  const onSubmit = (ev: SubmitEvent<HTMLFormElement>) => {
    ev.preventDefault()

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
      <ul className="">
        {
          messages && messages.map(item => (
            <li key={item.event_id} className="flex gap-2">
              <span className={`font-bold ${colors[item.user.color]}`}>
                {item.user.id === session.id ? 'You' : item.user.name}:
              </span>
              <p className="">
                {item.payload.message}
              </p>
            </li>
          ))
        }
      </ul>
      <form onSubmit={onSubmit}>
        <input ref={input} name="guess" type="text" placeholder="Type your guess" />
        <button>
          send
        </button>
      </form>
    </div >
  )
}
