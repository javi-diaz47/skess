import { useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type {
  GameEnded,
  GameStarted,
  GameUpdated,
  HintRevealed,
  RoundEnded,
  TurnEnded,
  WordSelected,
  WordSelectionStarted,
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
      setStatus((prev) => {
        return {
          ...DEFAULT_STATUS,
          state:
            prev.state === 'pause' || prev.state === 'end'
              ? 'start'
              : prev.state,
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

    const unsubWordSelectionStarted = subscribe(
      'word_selection_started',
      (ev: WordSelectionStarted) => {
        setStatus((prev) => {
          return {
            ...prev,
            state: 'selection',
            word_selection_timer: ev.word_selection_timer,
            sketcher: ev.sketcher,
            timestamp: ev.timestamp,
          }
        })
      },
    )

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
          state: prev?.state === 'pause' ? 'pause' : 'turn_end',
          hint: ev.hint,
          word_letter_count: ev.word_letter_count,
          turn_scores: ev.turn_scores,
          timestamp: ev.timestamp,
        }
      })
    })

    const unsubRoundEnded = subscribe('round_ended', (ev: RoundEnded) => {
      setStatus((prev) => {
        return {
          ...prev,
          state: prev?.state === 'pause' ? 'pause' : 'round_end',
          round: ev.round,
          max_rounds: ev.max_rounds,
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
        if (prev.state !== 'guess') {
          return prev
        }
        return {
          ...prev,
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

      unsubWordSelectionStarted()
      unsubWordSelected()

      unsubTurnEnded()
      unsubRoundEnded()

      unsubHintRevealed()
    }
  }, [subscribe])

  return (
    <GameStatusContext.Provider value={{ status }}>
      {children}
    </GameStatusContext.Provider>
  )
}
