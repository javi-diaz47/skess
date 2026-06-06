import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  WebSocketContext,
  type GameStarted,
  type GameUpdated,
  type HintRevealed,
  type TurnEnded,
  type UserWebSocket,
  type WordSelected,
} from './WebSockets/WebsSocketsContext'
import type { GamePaused } from './WebSockets/types'

type Status = {
  state: 'start' | 'guess' | 'end' | 'hint' | 'pause'
  sketcher: UserWebSocket
  timestamp: number | null
  guess_limit: number | null
  guess_word: string
  hint: string
  word_letter_count: number
  round: number | null
  max_rounds: number | null
  turn: number | null
  max_turns: number | null
}

export type GameStatusContextValue = {
  status: Status
}

export const GameStatusContext = createContext<GameStatusContextValue | null>(
  null,
)

export const GameStatusProvider = ({ children }: { children: string }) => {
  const { subscribe } = useContext(WebSocketContext)

  const logoutAudio = useRef<HTMLAudioElement>(null)
  const loginAudio = useRef<HTMLAudioElement>(null)

  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    loginAudio.current = new Audio('/sounds/player-join.mp3')
    logoutAudio.current = new Audio('/sounds/player-leave.mp3')

    const unsubPlayerAbandoned = subscribe('player_abandoned', () => {
      logoutAudio.current?.play()
    })

    const unsubPlayerJoined = subscribe('player_joined', () => {
      loginAudio.current?.play()
    })

    const unsubWordSelected = subscribe('word_selected', (ev: WordSelected) => {
      setStatus((prev) => {
        return {
          ...prev,
          state: 'guess',
          sketcher: ev.sketcher,
          timestamp: ev.timestamp,
          guess_limit: ev.guess_limit,
          hint: ev.hint,
          word_letter_count: ev.word_letter_count,
        }
      })
    })

    const unsubHintRevealed = subscribe('hint_revealed', (ev: HintRevealed) => {
      setStatus((prev) => {
        return {
          ...prev,
          state: prev?.state === 'pause' ? 'pause' : 'hint',
          hint: ev.hint,
          word_letter_count: ev.word_letter_count,
        }
      })
    })

    const unsubTurnEnded = subscribe('turn_ended', (ev: TurnEnded) => {
      setStatus((prev) => {
        return {
          ...prev,
          state: prev?.state === 'pause' ? 'pause' : 'end',
          hint: ev.hint,
          word_letter_count: ev.word_letter_count,
          timestamp: ev.timestamp,
        }
      })
    })

    const unsubGameStarted = subscribe('game_started', (ev: GameStarted) => {
      setStatus((prev) => {
        return {
          ...prev,
          state: 'start',
          round: ev.round,
          max_rounds: ev.max_rounds,
          turn: ev.turn,
          max_turns: ev.max_turns,
        }
      })
    })

    const unsubGameUpdated = subscribe('game_updated', (ev: GameUpdated) => {
      console.log('GAME UPDATED', ev)
      setStatus((prev) => {
        return {
          state: prev?.state === 'pause' ? 'pause' : 'guess',

          sketcher: ev.sketcher,
          timestamp: ev.timestamp,

          hint: ev.hint,
          word_letter_count: ev.word_letter_count,

          round: ev.round,
          max_rounds: ev.max_rounds,

          turn: ev.turn,
          max_turns: ev.max_turns,

          guess_limit: ev.guess_limit,

          leaderboard: ev.leaderboard,
        }
      })
    })

    const unsubGamePaused = subscribe('game_paused', (_: GamePaused) => {
      setStatus((prev) => {
        return {
          ...prev,
          state: 'pause',
        }
      })
    })

    return () => {
      unsubWordSelected()
      unsubGameStarted()
      unsubHintRevealed()
      unsubTurnEnded()
      unsubGameUpdated()
      unsubGamePaused()
      unsubPlayerAbandoned()
      unsubPlayerJoined()
    }
  }, [])

  return (
    <GameStatusContext.Provider value={{ status }}>
      {children}
    </GameStatusContext.Provider>
  )
}
