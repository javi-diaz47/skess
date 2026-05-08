import { useContext, useEffect } from "react"
import { useTimer } from "../hooks/useTimer"
import { ONE_SECOND_IN_MILISECONDS } from "../contants/secondsToMiliseconds"
import { Timer } from "./Timer"
import { GameStatusContext } from "../context/GameStatusContext"
import { CHAT_COLORS } from "../contants/chatColors"

export function StatusBar() {

  const { time, startTimer, cancelTimer } = useTimer()

  const { status } = useContext(GameStatusContext)

  useEffect(() => {

    if (status?.state === "guess") {

      const timestamp = new Date(status?.timestamp * ONE_SECOND_IN_MILISECONDS)
      const now = new Date()

      const diff = (now.getTime() - timestamp.getTime()) / ONE_SECOND_IN_MILISECONDS

      const leftTime = Math.round(status?.game_guess_limit - diff)

      if (leftTime > 0) {
        startTimer(leftTime)
      }

    }

    if (status?.state === "end") {
      cancelTimer()
    }

  }, [status])


  return (
    <section className="flex items-center gap-8">
      <Timer time={time} />

      {
        status?.hint && (
          <div>
            <p>
              {
                status?.hint?.split("").map((ch, i) => (
                  <span key={`${i}-${ch}`} className="mr-2">{ch}</span>
                ))
              }
            </p>
            <span>
              {status?.word_letter_count}
            </span>
          </div>
        )
      }

      {
        status?.sketcher && (
          <p className="break-all">
            <span className={`mr-2 font-bold ${CHAT_COLORS[status?.sketcher?.color]}`}>
              {status?.sketcher?.name}
            </span>
            is sketching!
          </p>
        )
      }


    </section>
  )
}
