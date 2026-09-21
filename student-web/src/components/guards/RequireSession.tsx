import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";

export function RequireSession() {
  const session = useSessionStore((s) => s.session);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}