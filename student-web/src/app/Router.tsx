import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/modules/auth/LoginPage";
import { ExamLanding } from "@/modules/exam/ExamLanding";
import { RequireSession } from "@/components/guards/RequireSession";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireSession />,
    children: [{ path: "/exam", element: <ExamLanding /> }],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;