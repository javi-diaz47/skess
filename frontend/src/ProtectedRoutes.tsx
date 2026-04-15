import { useContext } from "react";
import { SessionContext } from "./context/SessionContext";
import { Navigate, Outlet } from "react-router";

export function ProtectedRoutes() {

  const { hasSession } = useContext(SessionContext)

  if (!hasSession()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
