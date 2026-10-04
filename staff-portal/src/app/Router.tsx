import { createBrowserRouter, Navigate } from 'react-router-dom';

// --- Existing Staff Imports ---
import { LoginPage } from '@/modules/auth/LoginPage';
import { ForgotPasswordPage, SetPasswordPage } from '@/modules/auth/PasswordResetPage';
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
import { QuestionBankPage } from '@/modules/questions/QuestionBankPage';
import { QuestionBankEntryPage } from '@/modules/questions/QuestionBankEntryPage';
import { ExamListPage } from '@/modules/exam/ExamListPage';
import { ExamCreatePage } from '@/modules/exam/ExamCreatePage';
import { ExamDetailPage } from '@/modules/exam/ExamDetailPage';
import { ExamsToGradePage } from '@/modules/grading/ExamsToGradePage';
import { ExamGradingPage } from '@/modules/grading/ExamGradingPage';
import { AuditLogPage } from '@/modules/audit/AuditLogPage';
import { RetentionPolicyPage } from '@/modules/retention-policy/RetentionPolicyPage';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { InvigilationRoute } from '@/modules/invigilation/InvigilationRoute';
import { ResultsPage } from '@/modules/results/ResultsPage';
import { CourseOrCohortResult } from '@/modules/results/CourseOrCohortResult';
import { ExamResultsPage } from '@/modules/results/ExamResultsPage';

// --- NEW: Student Portal Imports ---
import { StudentLoginPage } from '@/modules/portal/StudentLoginPage';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { StudentCoursesPage } from '@/modules/portal/StudentCoursesPage';
import { StudentExamsPage } from '@/modules/portal/StudentExamsPage';
import { StudentResultsPage } from '@/modules/portal/StudentResultsPage';

const router = createBrowserRouter([
  // 1. Default Redirect
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  // 2. Public Auth Routes (Staff)
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/set-password', element: <SetPasswordPage /> },

  // 3. NEW: Public Student Login Route
  { path: '/student/login', element: <StudentLoginPage />, errorElement: <RouteErrorBoundary /> },

  // 4. Protected Routes
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/invigilation', element: <InvigilationRoute /> },
      { path: '/invigilation/:id', element: <InvigilationRoute /> },
      
      // --- Staff Protected Routes ---
      {
        element: <RequireRole roles={['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR', 'EXAM_ADMIN']} />,
        children: [
          {
            element: <StaffLayout />,
            errorElement: <RouteErrorBoundary />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/unauthorized', element: <div>You don't have access to this page.</div> },
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
                element: <RequireRole roles={['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR']} />,
                children: [
                  { path: '/questions', element: <QuestionBankEntryPage /> },
                  { path: '/courses/:courseId/questions', element: <QuestionBankPage /> },
                  { path: '/cohorts/:cohortId/questions', element: <QuestionBankPage /> },
                ],
              },
              {
                element: <RequireRole roles={['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR']} />,
                children: [
                  { path: '/exams', element: <ExamListPage /> },
                  { path: '/exams/new', element: <ExamCreatePage /> },
                  { path: '/exams/:id', element: <ExamDetailPage /> },
                  { path: '/grading', element: <ExamsToGradePage /> },
                  { path: '/grading/:id', element: <ExamGradingPage /> },
                  { path: '/results', element: <ResultsPage /> },
                  { path: '/results/course/:courseId', element: <CourseOrCohortResult /> },
                  { path: '/results/cohort/:cohortId', element: <CourseOrCohortResult /> },
                  { path: '/results/exam/:examId', element: <ExamResultsPage /> },
                ],
              },
              {
                element: <RequireRole roles={['EXAM_ADMIN']} />,
                children: [
                  { path: '/staff', element: <StaffListPage /> },
                  { path: '/audit', element: <AuditLogPage /> },
                  { path: '/retention-policy', element: <RetentionPolicyPage /> },
                ],
              },
            ],
          },
        ],
      },

      // --- NEW: Student Protected Routes ---
      // TEMPORARY FIX: Removed RequireRole wrapper to allow testing with mock data.
      // When the real backend is connected, the real JWT will contain the 'STUDENT' role, and we will put the guard back.
      {
        element: <StudentLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: '/student', element: <Navigate to="/student/courses" replace /> },
          { path: '/student/courses', element: <StudentCoursesPage /> },
          { path: '/student/exams', element: <StudentExamsPage /> },
          { path: '/student/results', element: <StudentResultsPage /> },
        ],
      },
    ],
  },
  
  // 5. Catch-all for undefined routes
  { path: '*', element: <RouteErrorBoundary /> },
]);

export default router;