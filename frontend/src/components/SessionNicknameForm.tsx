import { useContext, useRef, useState, type SubmitEvent } from "react"
import { SessionContext } from "../context/SessionContext"
import { useNavigate } from "react-router"

export function SessionNicknameForm() {

  const { session, hasSession, onCreateSession } = useContext(SessionContext)

  const input = useRef<HTMLInputElement>(null)
  const [isEmptyInput, setIsEmptyInput] = useState(false);


  const navigate = useNavigate()

  const onSubmit = (ev: SubmitEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (input.current.value.length === 0) {
      if (!isEmptyInput) {
        setIsEmptyInput(true);
      }
      return
    }

    if (isEmptyInput) {
      setIsEmptyInput(false)
    }

    onCreateSession({ name: input.current.value })
    navigate("/")
  }

  return (
    <form onSubmit={onSubmit} className="w-96 flex flex-col gap-4 bg-primary-900 p-4 rounded-2xl">
      <label className="text-2xl">
        How you want to  be known?
      </label>
      <div className="flex gap-2">
        <input ref={input} defaultValue={hasSession() ? session.name : ''} maxLength={20} className="w-full h-10 px-4 py-2 rounded-full bg-background-100 text-text-900 dark:bg-primary-800 dark:text-text-50" placeholder="Sketch Queen..." />
        <button className="w-10 aspect-square grid place-items-center cursor-pointer rounded-full bg-radial-[at_25%_25%] from-primary-500 from-50% to-primary-300 hover:from-primary-400 dark:from-primary-600 dark:to-primary-500 hover:dark:from-primary-500 hover:dark:to-primary-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-send"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 14l11 -11" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" /></svg>
        </button>
      </div>
      {
        isEmptyInput && (
          <p className="w-fit px-2 py-1 rounded-full duration-150 text-text-50 bg-accent-800 ring-2 ring-accent-300">
            Sorry, but we need a nickname
          </p>
        )
      }
    </form >
  )
}

