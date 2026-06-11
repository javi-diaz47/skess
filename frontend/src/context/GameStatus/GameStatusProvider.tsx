import { useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type {
  GameEnded,
  GameStarted,
  GameUpdated,
  HintRevealed,
  TurnEnded,
  WordSelected,
} from '../WebSockets/types'
import { DEFAULT_STATUS, type Status } from './types'
import { WebSocketContext } from '../WebSockets/WebsSocketsContext'
import { GameStatusContext } from './GameStatusContext'

export const GameStatusProvider = ({ children }: { children: ReactNode }) => {
  const { subscribe } = useContext(WebSocketContext)

  const logoutAudio = useRef<HTMLAudioElement>(null)
  const loginAudio = useRef<HTMLAudioElement>(null)

  const [status, setStatus] = useState<Status>(DEFAULT_STATUS)

  useEffect(() => {
    loginAudio.current = new Audio('/sounds/player-join.mp3')
    logoutAudio.current = new Audio('/sounds/player-leave.mp3')

    const unsubPlayerAbandoned = subscribe('player_abandoned', () => {
      logoutAudio.current?.play()
    })

    const unsubPlayerJoined = subscribe('player_joined', () => {
      loginAudio.current?.play()
    })

    const unsubGameStarted = subscribe('game_started', (ev: GameStarted) => {
      setStatus(() => {
        return {
          ...DEFAULT_STATUS,
          state: 'start',
          round: ev.round,
          max_rounds: ev.max_rounds,
          turn: ev.turn,
          max_turns: ev.max_turns,
          sketcher: ev.sketcher,
        }
      })
    })

    const unsubGamePaused = subscribe('game_paused', () => {
      setStatus((prev) => {
        return {
          ...prev,
          state: 'pause',
        }
      })
    })

    const unsubGameUpdated = subscribe('game_updated', (ev: GameUpdated) => {
      console.log('GAME UPDATED', ev)

      setStatus((prev) => {
        return {
          ...prev,
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

    const unsubTurnEnded = subscribe('turn_ended', (ev: TurnEnded) => {
      setStatus((prev) => {
        return {
          ...prev,
          state: prev?.state === 'pause' ? 'pause' : 'end',
          hint: ev.hint,
          word_letter_count: ev.word_letter_count,
          turn_scores: ev.turn_scores,
          timestamp: ev.timestamp,
        }
      })
    })

    const unsubGameEnded = subscribe('game_ended', (ev: GameEnded) => {
      setStatus((prev) => {
        return {
          ...prev,
          state: prev?.state === 'pause' ? 'pause' : 'end',
          leaderboard: ev.leaderboard,
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

    return () => {
      unsubPlayerJoined()
      unsubPlayerAbandoned()

      unsubGameStarted()
      unsubGamePaused()
      unsubGameUpdated()
      unsubGameEnded()

      unsubWordSelected()

      unsubTurnEnded()

      unsubHintRevealed()
    }
  }, [subscribe])

  return (
    <GameStatusContext.Provider value={{ status }}>
      {children}
    </GameStatusContext.Provider>
  )
}
