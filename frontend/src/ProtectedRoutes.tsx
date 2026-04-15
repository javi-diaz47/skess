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

  return <Outlet />
}
