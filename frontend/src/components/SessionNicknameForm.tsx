import { useContext, useRef, useState, type SubmitEvent } from "react"
import { SessionContext, type CreateUserSession } from "../context/SessionContext"
import { useNavigate } from "react-router"
import { Highlight } from "./Highlight"

export function SessionNicknameForm() {

  const { session, hasSession, onCreateSession } = useContext(SessionContext)

  const input = useRef<HTMLInputElement>(null)
  const [isEmptyInput, setIsEmptyInput] = useState(false);


  const navigate = useNavigate()

  const onSubmit = (ev: SubmitEvent<HTMLFormElement>) => {
    ev.preventDefault()

    const form = ev.currentTarget
    const formData = new FormData(form)

    const data: CreateUserSession = {
      name: String(formData.get("name") || "").trim(),
      room_id: String(formData.get("room_id") || "")
    }

    if (data.name.length === 0) {
      if (!isEmptyInput) {
        setIsEmptyInput(true);
      }
      return
    }

    if (isEmptyInput) {
      setIsEmptyInput(false)
    }

    onCreateSession({ ...data })
    navigate("/")
  }

  return (
    <div className="w-fit grid gap-8">
      <form onSubmit={onSubmit} className="w-full max-w-md flex flex-col gap-4 text-text-900 dark:text-text-50 bg-purple-50 dark:bg-primary-900 p-8 rounded-2xl dark:border-1 dark:border-primary-500 shadow-md dark:shadow-primary-500">
        <div className="flex gap-2">
          <svg className="text-primary-400" xmlns="http://www.w3.org/2000/svg" width={36} height={36} viewBox="0 0 24 24" fill="currentColor">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M16 19a1 1 0 0 1 0 -2a1 1 0 0 0 1 -1c0 -1.333 2 -1.333 2 0a1 1 0 0 0 1 1c1.333 0 1.333 2 0 2a1 1 0 0 0 -1 1c0 1.333 -2 1.333 -2 0a1 1 0 0 0 -1 -1" />
            <path d="M3 11a5 5 0 0 0 5 -5c0 -1.333 2 -1.333 2 0a5 5 0 0 0 5 5c1.333 0 1.333 2 0 2a5 5 0 0 0 -5 5a1 1 0 0 1 -2 0a5 5 0 0 0 -5 -5c-1.333 0 -1.333 -2 0 -2" />
            <path d="M16 7a1 1 0 0 1 0 -2a1 1 0 0 0 1 -1c0 -1.333 2 -1.333 2 0a1 1 0 0 0 1 1c1.333 0 1.333 2 0 2a1 1 0 0 0 -1 1c0 1.333 -2 1.333 -2 0a1 1 0 0 0 -1 -1" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-bold">
            Who's sketching today?
          </h2>
        </div>

        <p className="text-text-900 dark:text-text-100 mb-4">
          Choose a name and optionally add a room ID to get started.
        </p>

        <div className="grid gap-2">
          <label htmlFor="name" className="flex gap-2 font-bold">
            <svg className="text-primary-500" xmlns=" http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
              <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </svg>
            Display name
          </label >
          <div className="flex text-lg w-full px-4 py-2 rounded-2xl bg-primary-100/40 dark:bg-primary-800/60 text-text-950 dark:text-text-50 border-1 border-primary-500">
            <input id="name" name="name" type="text" placeholder="Sketch Queen..."
              className="flex-1 outline-none placeholder:font-normal"
            />
          </div>

          {
            isEmptyInput && (
              <p className="w-fit px-2 py-1 rounded-full duration-150 text-text-950 dark:text-text-50 bg-accent-200 dark:bg-accent-800 ring-2 ring-accent-300">
                Sorry, but we need a nickname
              </p>
            )
          }
        </div>

        <div className="grid gap-2 mb-2">
          <label htmlFor="room_id" className="flex gap-2 font-bold">
            <svg className="text-primary-500" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 9l14 0" />
              <path d="M5 15l14 0" />
              <path d="M11 4l-4 16" />
              <path d="M17 4l-4 16" />
            </svg>
            Room id (optional)
          </label>
          <div className="flex text-lg w-full px-4 py-2 rounded-2xl bg-primary-100/40 dark:bg-primary-800/60 text-text-950 dark:text-text-50 border-1 border-primary-500">
            <input id="room_id" name="room_id" type="text" placeholder="room-42..."
              className="flex-1 outline-none placeholder:font-normal"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-text-900 dark:text-text-100">
          <svg className="text-primary-500" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06" />
            <path d="M15 19l2 2l4 -4" />
          </svg>
          <p className="text-sm">
            You always can change this later
          </p>

        </div>

        <button type="submit" className="mb-4 text-xl p-3 rounded-2xl bg-primary-500 font-bold text-text-50 border-1 border-primary-500 hover:scale-105 active:scale-100 duration-125 cursor-pointer">
          Let's play
        </button>

      </form >
    </div>
  )
}

