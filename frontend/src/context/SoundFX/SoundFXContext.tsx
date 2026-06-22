import { createContext } from 'react'

export type Sounds =
  | 'player-join'
  | 'player-leave'
  | 'start-round'
  | 'end-game'
  | 'timer'

export type SoundsFx = {
  [K in Sounds]: HTMLAudioElement
}

interface SoundFxContext {
  volume: number
  play: (fx: Sounds) => void
  pause: (fx: Sounds) => void
  updateVolume: (newVolume: number) => void
}

const DEFAULT_SOUND_FX_CONTEXT = {
  volume: 0,
  play: () => {},
  pause: () => {},
  updateVolume: () => {},
}

export const SoundFxContext = createContext<SoundFxContext>(
  DEFAULT_SOUND_FX_CONTEXT,
)
