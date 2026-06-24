import { useContext, useEffect, useRef, useState } from 'react'
import { SoundFxContext } from '../context/SoundFX/SoundFXContext'
import { VolumeIcon, type VolumeLevel } from './VolumeIcon'

export function VolumeMenu() {
  const { volume, updateVolume } = useContext(SoundFxContext)

  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const close = (ev: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(ev.target as Node) &&
        !buttonRef.current?.contains(ev.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', close)

    return () => document.removeEventListener('mousedown', close)
  })

  const getVolumeLevel = (volume: number): VolumeLevel => {
    if (volume > 66) return 'high'
    if (volume > 33) return 'medium'
    if (volume > 0) return 'low'
    return 'muted'
  }

  return (
    <div className="relative flex items-center z-10">
      <button
        ref={buttonRef}
        className="cursor-pointer "
        onClick={() => setIsOpen(!isOpen)}>
        <VolumeIcon volumeLevel={getVolumeLevel(volume)} />
      </button>
      <div
        ref={menuRef}
        className={`flex items-center gap-2 absolute right-0 top-10 border-2
            shadow-lg shadow-background-200 dark:shadow-background-700 
            rounded-xl duration-200 overflow-hidden 
            ${
              isOpen
                ? 'w-68 h-12 p-4 bg-background-100 dark:bg-background-900 border-background-200 dark:border-background-400'
                : 'w-0 h-12 p-0 bg-transparent border-transparent shadow-transparent'
            }`}>
        <VolumeIcon volumeLevel="muted" />
        <label className={`flex items-center gap-2`}>
          <input
            value={volume}
            onChange={(ev) => updateVolume(Number(ev.target.value))}
            className={`accent-accent-500 w-32 cursor-grab active:cursor-grabbing`}
            type="range"
            min={0}
            max={100}
            step={1}
          />
          <span className="w-7 text-right font-bold">{volume}</span>
        </label>
        <VolumeIcon volumeLevel="high" />
      </div>
    </div>
  )
}
