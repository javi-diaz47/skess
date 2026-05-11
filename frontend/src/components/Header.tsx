import { useContext, useEffect, useState } from "react"
import { SessionContext } from "../context/SessionContext"
import { DarkThemeToggle } from "./DarkThemeToggle"

type Theme = "light" | "dark"

export function Header() {

  const { session, onDeleteSession } = useContext(SessionContext)

  const [theme, setTheme] = useState<Theme>("light")

  const onSetTheme = (newTheme: Theme) => {
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    setTheme(newTheme)
    setTheme(newTheme)
  }

  useEffect(() => {

    if ("theme" in localStorage) {
      const newTheme = localStorage.getItem("theme")

      if (theme !== newTheme && (newTheme === "light" || newTheme === "dark")) {
        onSetTheme(newTheme)
      }
      return
    }

    if ((!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      onSetTheme("dark")
    }

  }, [])

  const onToggleDarkTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    onSetTheme(newTheme)
  }



  return (
    <header className="text-text-900 dark:text-text-50 flex justify-between items-center py-4 rounded-full">
      <h1 className="text-4xl font-bold">Skess</h1>

      <div className="flex items-center gap-6">
        {
          session?.id && (
            <div className="group">
              <button
                onClick={onDeleteSession}
                className="cursor-pointer active:scale-100 hover:scale-110 font-bold group-hover:translate-x-0 group-hover:w-fit group-hover:h-fit group-hover:py-1 group-hover:px-2 group-hover:opacity-100 translate-x-5 opacity-0 min-w-0 w-0 min-h-0 h-0 overflow-hidden duration-150 text-accent-500 mr-2 bg-accent-100 rounded-full">
                Log out
              </button>
              <p className="inline font-bold text-right">{session.name}</p>
            </div>
          )
        }

        <DarkThemeToggle
          className="text-text-900 dark:text-text-50"
          onClick={onToggleDarkTheme}
        />
      </div>

    </header>
  )
}
