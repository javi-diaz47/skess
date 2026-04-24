import { useContext, useEffect, useState } from "react"
import { SessionContext } from "./context/SessionContext"
import { Chat } from "./components/Chat";
import { SketchBoard } from "./components/SketchBoard"
import { Leaderboard } from "./components/Leaderboard";
import { WordSelector } from "./components/WordSelector";

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
      <Chat />
      <WordSelector />
      <SketchBoard />
      <Leaderboard />
    </div>
  )
}
