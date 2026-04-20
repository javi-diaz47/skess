import { useContext } from "react"
import { SessionContext } from "./context/SessionContext"
import { SketchBoard } from "./components/SketchBoard"

export function Home() {

  const { session, onDeleteSession } = useContext(SessionContext)
  return (
    <div>
      <h2>Home</h2>
      <p>{session.id}</p>
      <p>{session.name}</p>
      <button onClick={onDeleteSession}>
        Close session
      </button>
      <SketchBoard />
    </div>
  )
}
