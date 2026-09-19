import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/modules/auth/LoginPage';
import { ForgotPasswordPage } from '@/modules/auth/PasswordResetPage';
import { RequireAuth } from '@/components/guards/RequireAuth';
import { RequireRole } from '@/components/guards/RequireRole';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { RouteErrorBoundary } from '@/components/shared/ErrorBoundary';
import { StudentDirectoryPage } from '@/modules/students/StudentDirectoryPage';
import { StaffListPage } from '@/modules/staff/StaffListPage';
import { CourseListPage } from '@/modules/course/CourseListPage';
import { CourseRosterPage } from '@/modules/course/CourseRosterPage';
import { CohortListPage } from '@/modules/cohorts/CohortListPage';
import { CohortRosterPage } from '@/modules/cohorts/CohortRosterPage';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <RequireRole roles={['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR', 'EXAM_ADMIN']} />,
        children: [
          {
            element: <StaffLayout />,
            errorElement: <RouteErrorBoundary />,
            children: [
              { path: '/dashboard', element: <div>Dashboard</div> },
              { path: '/unauthorized', element: <div>You don't have access to this page.</div> },
              { path: '/profile', element: <div>Profile</div> },
              {
                element: <RequireRole roles={['INSTRUCTOR', 'EXAM_ADMIN']} />,
                children: [
                  { path: '/courses', element: <CourseListPage /> },
                  { path: '/courses/:id', element: <CourseRosterPage /> },
                ],
              },
              {
                element: <RequireRole roles={['EXIT_EXAM_COORDINATOR', 'EXAM_ADMIN']} />,
                children: [
                  { path: '/students', element: <StudentDirectoryPage /> },
                  { path: '/cohorts', element: <CohortListPage /> },
                  { path: '/cohorts/:id', element: <CohortRosterPage /> },
                ],
              },
              {
                element: <RequireRole roles={['EXAM_ADMIN']} />,
                children: [{ path: '/staff', element: <StaffListPage /> }],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <RouteErrorBoundary /> },
]);

export default router;