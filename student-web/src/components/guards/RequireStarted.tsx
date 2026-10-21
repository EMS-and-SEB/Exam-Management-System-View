import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";

export function RequireStarted() {
  const session = useSessionStore((s) => s.session);

  if (!session || !session.endsAt || session.examQuestions.length === 0) {
    return <Navigate to="/waiting" replace />;
  }

  return <Outlet />;
}