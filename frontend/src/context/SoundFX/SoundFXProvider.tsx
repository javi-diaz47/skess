import { useEffect, useRef, useState, type ReactNode } from 'react'
import { SoundFxContext, type Sounds, type SoundsFx } from './SoundFXContext'

export const SoundFxProvider = ({ children }: { children: ReactNode }) => {
  const [volume, setVolume] = useState(100)
  const sounds = useRef<SoundsFx | null>(null)

  useEffect(() => {
    sounds.current = {
      'player-join': new Audio('/sounds/player-join.mp3'),
      'player-leave': new Audio('/sounds/player-leave.mp3'),
      'start-round': new Audio('/sounds/start-round.mp3'),
      'end-game': new Audio('/sounds/end-game.mp3'),
      timer: new Audio('/sounds/timer.mp3'),
    }
  }, [])

  useEffect(() => {
    Object.values(sounds).forEach((audio) => {
      if (audio instanceof HTMLAudioElement) {
        audio.volume = volume
      }
    })
  }, [sounds, volume])

  const pause = (fx: Sounds) => {
    if (!sounds.current) return

    sounds.current[fx].pause()
    sounds.current[fx].currentTime = 0
  }

  const play = (fx: Sounds) => {
    if (!sounds.current) return
    console.log(sounds.current[fx])
    sounds.current[fx].play()
  }

  return (
    <SoundFxContext.Provider
      value={{
        setVolume,
        pause,
        play,
      }}>
      {children}
    </SoundFxContext.Provider>
  )
}
