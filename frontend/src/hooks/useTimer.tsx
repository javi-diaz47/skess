import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTimer {
  onEndCallback?: () => void
}

export function useTimer(props?: UseTimer) {
  const [time, setTime] = useState<number>(0)
  const interval = useRef<number | undefined>(undefined)
  const callbackRef = useRef(props?.onEndCallback)

  const clearTime = () => {
    clearInterval(interval.current)
    interval.current = undefined
  }

  const cancelTimer = useCallback(() => {
    clearTime()
    setTime(0)
  }, [])

  const startTimer = useCallback(
    (time: number) => {
      cancelTimer()
      setTime(time)
      interval.current = setInterval(() => {
        setTime((prev) => Math.max(prev - 1, 0))
      }, 1000)
    },
    [cancelTimer],
  )

  // remove the interval when component unmounts
  useEffect(() => {
    return () => {
      cancelTimer()
    }
  }, [cancelTimer])

  // update the callback function each time it receives a new one
  useEffect(() => {
    callbackRef.current = props?.onEndCallback
  }, [props])

  // Execute onEndCallback and remove time interval
  useEffect(() => {
    if (time !== 0) return

    callbackRef.current?.()
    clearTime()
  }, [time])

  return {
    time: time ?? 0,
    startTimer,
    cancelTimer,
  }
}
