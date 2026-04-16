import { useContext } from "react"
import { SessionContext } from "./context/SessionContext"

export function Home() {

  const { session } = useContext(SessionContext)
  return (
    <div>
      <h2>Home</h2>
      <p>{session.id}</p>
      <p>{session.name}</p>
    </div>
  )
}
