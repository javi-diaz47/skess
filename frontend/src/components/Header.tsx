import { useContext } from 'react'
import { SessionContext } from '../context/session/SessionContext'
import { VolumeMenu } from './VolumeMenu'
import { DarkThemeMenu } from './DarkThemeMenu'

export function Header() {
  const { session, onDeleteSession } = useContext(SessionContext)

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

        <DarkThemeMenu />

        <VolumeMenu />
      </div>
    </header>
  )
}
