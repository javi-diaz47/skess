import { createContext, useContext, useEffect, useState } from "react";
import { WebSocketContext } from "./WebsSocketsContext";
import type { UserSession } from "./SessionContext";

type Status = {
  state: "start" | "guess" | "end" | "hint"
  sketcher: UserSession
  timestamp: number | null
  game_guess_limit: number | null
  guess_word: string
  hint: string
  word_letter_count: number
  game_round: number | null
  game_max_round: number | null
  game_turn: number | null
  game_max_turn: number | null
}

export type GameStatusContextValue = {
  status: Status
}

export const GameStatusContext = createContext<GameStatusContextValue | null>(null)

export const GameStatusProvider = ({ children }) => {

  const { subscribe } = useContext(WebSocketContext)

  const [status, setStatus] = useState<Status | null>(null)


  useEffect(() => {

    const unsubstatus = subscribe("status", (ev) => {

      setStatus(prev => {
        console.log(ev.payload.status, ev)

        if (ev?.payload?.status === "start") {
          return ({
            ...prev,
            state: ev?.payload?.status,
            sketcher: ev?.payload?.sketcher,
            timestamp: ev.timestamp,
            game_guess_limit: ev.game_guess_limit,
            hint: ev?.payload?.hint,
            word_letter_count: ev?.payload?.word_letter_count,
            game_round: ev?.game_round,
            game_max_round: ev?.game_max_round,
            game_turn: ev?.game_turn,
            game_max_turn: ev?.game_max_turn
          })
        }

        if (ev?.payload?.status === "hint") {
          return ({ ...prev, state: ev?.payload?.status, hint: ev?.payload?.hint, word_letter_count: ev?.payload?.word_letter_count })
        }

        return ({
          ...prev,
          state: ev?.payload?.status,
          sketcher: ev?.payload?.sketcher,
          timestamp: ev.timestamp,
          game_guess_limit: ev.game_guess_limit,
          hint: ev?.payload?.hint,
          word_letter_count: ev?.payload?.word_letter_count,
        })
      })
    })


    return () => unsubstatus()

  }, [])

  return (
    <GameStatusContext.Provider value={{ status }}>
      {children}
    </GameStatusContext.Provider>
  )
}
