export type VolumeLevel = 'muted' | 'low' | 'medium' | 'high'

interface VolumeIcon {
  volumeLevel: VolumeLevel
}

export function VolumeIcon({ volumeLevel }: VolumeIcon) {
  switch (volumeLevel) {
    case 'muted':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
          <path d="M16 10l4 4m0 -4l-4 4" />
        </svg>
      )

    case 'low':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9.5 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
        </svg>
      )

    case 'medium':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15 8a5 5 0 0 1 0 8" />
          <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
        </svg>
      )

    case 'high':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15 8a5 5 0 0 1 0 8" />
          <path d="M17.7 5a9 9 0 0 1 0 14" />
          <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
        </svg>
      )

    default: {
      const _exhaustive: never = volumeLevel
      return _exhaustive
    }
  }
}
