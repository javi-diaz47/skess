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
      <main className="flex gap-8 p-8 relative">
        <SketchBoard />
        <Chat />
        <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-accent-300">
          <WordSelector />
        </div>
        <Leaderboard />
      </main>
    </div>
  )
}
