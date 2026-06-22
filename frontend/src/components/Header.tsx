import { useContext, useEffect, useState } from 'react'
import { SessionContext } from '../context/session/SessionContext'
import { DarkThemeToggle } from './DarkThemeToggle'
import { SoundFxContext } from '../context/SoundFX/SoundFXContext'

type Theme = 'light' | 'dark'

export function Header() {
  const { session, onDeleteSession } = useContext(SessionContext)
  const { volume, updateVolume } = useContext(SoundFxContext)

  const getInitialTheme = (): Theme => {
    const stored = localStorage.getItem('theme')

    if (stored === 'light' || stored === 'dark') {
      return stored
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  const onToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="text-sm md:text-base text-text-900 dark:text-text-50 flex justify-between items-center md:py-4 rounded-full">
      <h1 className="text-2xl md:text-4xl font-bold">Skess</h1>

      <div className="flex items-center gap-5">
        {session?.id && (
          <div className="group">
            <button
              onClick={onDeleteSession}
              className="cursor-pointer active:scale-100 hover:scale-110 font-bold 
                md:group-hover:translate-x-0 md:group-hover:w-fit md:group-hover:h-fit md:group-hover:py-1 md:group-hover:px-2 md:group-hover:opacity-100 
                md:translate-x-5 md:opacity-0 md:min-w-0 md:w-0 md:min-h-0 md:h-0 py-1 px-2 md:p-0
                overflow-hidden duration-150 text-accent-500 mr-2 bg-accent-100 rounded-full
              ">
              Log out
            </button>
            <p className="inline font-bold text-right">{session.name}</p>
          </div>
        )}

        <DarkThemeToggle
          className="text-text-900 dark:text-text-50"
          onClick={onToggleTheme}
        />

        <div className="relative flex items-center">
          <button
            className="cursor-pointer "
            onClick={() => setIsOpen(!isOpen)}>
            {volume > 66 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-volume">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 8a5 5 0 0 1 0 8" />
                <path d="M17.7 5a9 9 0 0 1 0 14" />
                <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
              </svg>
            ) : volume > 33 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-volume-2">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 8a5 5 0 0 1 0 8" />
                <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
              </svg>
            ) : volume > 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-volume-4">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9.5 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-volume-3">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                <path d="M16 10l4 4m0 -4l-4 4" />
              </svg>
            )}
          </button>
          <div
            className={`
            flex items-center gap-2 absolute right-0 top-10 border-2
            shadow-lg shadow-background-200 dark:shadow-background-700 
            rounded-xl duration-200 overflow-hidden 
            ${
              isOpen
                ? 'w-68 h-12 p-4 bg-background-100 dark:bg-background-900 border-background-200 dark:border-background-500'
                : 'w-0 h-12 p-0 bg-transparent border-transparent shadow-transparent'
            }`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
              <path d="M16 10l4 4m0 -4l-4 4" />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M15 8a5 5 0 0 1 0 8" />
              <path d="M17.7 5a9 9 0 0 1 0 14" />
              <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}
