import { useEffect, useRef, useState, type ReactNode } from 'react'
import { SoundFxContext, type Sounds, type SoundsFx } from './SoundFXContext'

const MAX_VOLUME = 100

export const SoundFxProvider = ({ children }: { children: ReactNode }) => {
  const [volume, setVolume] = useState(MAX_VOLUME)
  const sounds = useRef<SoundsFx | null>(null)

  const pause = (fx: Sounds) => {
    if (!sounds.current) return

    sounds.current[fx].pause()
    sounds.current[fx].currentTime = 0
  }

  const play = (fx: Sounds) => {
    if (!sounds.current) return

    sounds.current[fx].play()
  }

  const syncVolume = (newVolume: number) => {
    if (!sounds.current) return
    console.log(newVolume)
    Object.values(sounds.current).forEach((audio) => {
      audio.volume = newVolume / MAX_VOLUME
    })
  }

  const updateVolume = (newVolume: number) => {
    localStorage.setItem('volume', String(newVolume))

    syncVolume(newVolume)
    setVolume(newVolume)
  }

  useEffect(() => {
    sounds.current = {
      'player-join': new Audio('/sounds/player-join.mp3'),
      'player-leave': new Audio('/sounds/player-leave.mp3'),
      'start-round': new Audio('/sounds/start-round.mp3'),
      'end-game': new Audio('/sounds/end-game.mp3'),
      timer: new Audio('/sounds/timer.mp3'),
    }

    const stored = localStorage.getItem('volume')

    if (stored && Number(stored) >= 0 && Number(stored) <= 100) {
      syncVolume(Number(stored))
    }
  }, [])

  return (
    <SoundFxContext.Provider
      value={{
        volume,
        updateVolume,
        pause,
        play,
      }}>
      {children}
    </SoundFxContext.Provider>
  )
}
