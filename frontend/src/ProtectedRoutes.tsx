import { useContext } from "react";
import { SessionContext } from "./context/SessionContext";
import { Navigate, Outlet } from "react-router";

export function ProtectedRoutes() {

  const { isLoading, hasSession } = useContext(SessionContext)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!hasSession()) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="h-screen bg-background-50 text-text-950 dark:bg-background-950 dark:text-text-50">
      <Outlet />
    </div>
  )
}
