import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/modules/auth/LoginPage";
import { ExamLanding } from "@/modules/exam/ExamLanding";
import { WaitingRoom } from "@/modules/waiting/WaitingRoom";
import { RequireSession } from "@/components/guards/RequireSession";
import { RequireStarted } from "@/components/guards/RequireStarted";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireSession />,
    children: [
      { path: "/waiting", element: <WaitingRoom /> },
      {
        element: <RequireStarted />,
        children: [{ path: "/exam", element: <ExamLanding /> }],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;
