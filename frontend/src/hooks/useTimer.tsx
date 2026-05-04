import { useEffect, useRef, useState } from "react"

interface UseTimer {
  onEndCallback?: () => void
}

export function useTimer(props?: UseTimer) {

  const [time, setTime] = useState<number | null>(null)
  const interval = useRef<number | undefined>(undefined)

  const startTimer = (time: number) => {
    setTime(time)
    interval.current = setInterval(() => {
      setTime(prev => prev - 1)
    }, 1000)
  }

  const cancelTimer = () => {
    clearInterval(interval.current)
    setTime(null)
  }


  useEffect(() => {
    return () => {
      cancelTimer()
    }
  }, [])

  useEffect(() => {
    if (time === 0) {
      props?.onEndCallback()
      cancelTimer()
    }
  }, [time])


  return {
    time: time ?? 0,
    startTimer,
    cancelTimer,
  }
}
