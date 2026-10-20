import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/modules/auth/LoginPage';
import { ActivateAccountPage } from '@/modules/auth/ActivateAccountPage';
import { ForgotPasswordPage, SetPasswordPage } from '@/modules/auth/PasswordResetPage';
import { RequireAuth } from '@/components/guards/RequireAuth';
import { RequireRole } from '@/components/guards/RequireRole';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { RouteErrorBoundary } from '@/components/shared/ErrorBoundary';
import { StudentDirectoryPage } from '@/modules/students/StudentDirectoryPage';
import { StudentDetailPage } from '@/modules/students/StudentDetailPage';
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
import { StudentDashboardPage } from '@/modules/dashboard/StudentDashboardPage';
import { InvigilationRoute } from '@/modules/invigilation/InvigilationRoute';
import { ResultsPage } from '@/modules/results/ResultsPage';
import { CourseOrCohortResult } from '@/modules/results/CourseOrCohortResult';
import { ExamResultsPage } from '@/modules/results/ExamResultsPage';
import { InvigilatorAssignmentPage } from '@/modules/invigilator-assignment/InvigilatorAssignmentPage';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  { path: '/activate-account', element: <ActivateAccountPage />, errorElement: <RouteErrorBoundary /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/set-password', element: <SetPasswordPage /> },
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <RequireRole roles={['STUDENT']} />,
        children: [{ path: '/student-dashboard', element: <StudentDashboardPage /> }],
      },
      { path: '/invigilation', element: <InvigilationRoute /> },
      { path: '/invigilation/:id', element: <InvigilationRoute /> },
      {
        element: <RequireRole roles={['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR', 'SUPER_ADMIN', 'UNIT_ADMIN']} />,
        children: [
          {
            element: <StaffLayout />,
            errorElement: <RouteErrorBoundary />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/unauthorized', element: <div>You don't have access to this page.</div> },
              {
                element: <RequireRole roles={['INSTRUCTOR', 'SUPER_ADMIN', 'UNIT_ADMIN']} />,
                children: [
                  { path: '/courses', element: <CourseListPage /> },
                  { path: '/courses/:id', element: <CourseRosterPage /> },
                ],
              },
              {
                element: <RequireRole roles={['EXIT_EXAM_COORDINATOR', 'SUPER_ADMIN', 'UNIT_ADMIN']} />,
                children: [
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
                element: <RequireRole roles={['SUPER_ADMIN', 'UNIT_ADMIN']} />,
                children: [
                  { path: '/staff', element: <StaffListPage /> },
                  { path: '/students', element: <StudentDirectoryPage /> },
                  { path: '/students/:id', element: <StudentDetailPage /> },
                ],
              },
              {
                element: <RequireRole roles={['SUPER_ADMIN']} />,
                children: [
                  { path: '/audit', element: <AuditLogPage /> },
                  { path: '/retention-policy', element: <RetentionPolicyPage /> },
                ],
              },
              {
                element: <RequireRole roles={['UNIT_ADMIN']} />,
                children: [ 
                   { path: '/invigilator-assignment', element: <InvigilatorAssignmentPage /> },
                ]
              }
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <RouteErrorBoundary /> },
]);

export default router;
