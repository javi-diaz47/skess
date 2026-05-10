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
    <section className="flex text-text-900 dark:text-text-50 justify-around items-center gap-8">
      <Timer time={time} />

      {
        status?.hint && (
          <div className="flex justify-center gap-4 md:text-2xl font-bold bg-background-100 dark:bg-background-900 rounded-full py-4 px-8">
            <p>
              {
                status?.hint.split("").map((ch, i) => (
                  <span key={`${i}-${ch}`} className="mr-2">{ch}</span>
                ))
              }
            </p>
            <span className="self-end text-xs md:text-base">
              {status?.word_letter_count}
            </span>
          </div>
        )
      }

      {
        status?.sketcher && (
          <p className="break-all max-w-72 text-sm md:text-base bg-background-100 dark:bg-background-900 rounded-full py-4 px-8">
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
