import { useEffect, useState } from 'react'
import { DarkThemeToggle } from './DarkThemeToggle'

type Theme = 'light' | 'dark'

export function DarkThemeMenu() {
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

  return (
    <DarkThemeToggle
      className="text-text-900 dark:text-text-50 cursor-pointer"
      onClick={onToggleTheme}
    />
  )
}
