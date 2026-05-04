import { useContext } from "react"
import { SessionContext } from "../context/SessionContext"

export function Header() {

  const { session, onDeleteSession } = useContext(SessionContext)

  return (
    <header className="bg-background-500 text-text-50 flex justify-between items-center py-4 px-12 rounded-full">
      <h1 className="text-2xl font-bold bg-primary-500">Skess</h1>
      <div className="group">
        <button
          onClick={onDeleteSession}
          className="cursor-pointer active:scale-100 hover:scale-110 font-bold group-hover:translate-x-0 group-hover:w-fit group-hover:h-fit group-hover:py-1 group-hover:px-2 group-hover:opacity-100 translate-x-5 opacity-0 min-w-0 w-0 min-h-0 h-0 overflow-hidden duration-150 text-accent-500 mr-2 bg-accent-100 rounded-full">
          Log out
        </button>
        <p className="inline font-bold text-right">{session.name}</p>
      </div>
    </header>
  )
}
