import { useContext } from 'react'
import { SessionContext } from './context/session/SessionContext'
import { Navigate, Outlet } from 'react-router'

export function ProtectedRoutes() {
  const { session } = useContext(SessionContext)
  if (session === null) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex justify-center h-dvh bg-background-50 text-text-950 dark:bg-background-950 dark:text-text-50">
      <Outlet />
    </div>
  )
}
