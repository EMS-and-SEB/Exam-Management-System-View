import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { InvigilatorLayout } from '@/components/layout/InvigilatorLayout';
import { InvigilationOverviewPage } from './InvigilationOverviewPage';
import { ExamMonitoringPage } from './ExamMonitoringPage';

const STAFF_ROLES = ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] as const;

export function InvigilationRoute() {
  const role = useAuthStore((state) => state.user?.role);
  const { id } = useParams();
  const page = id ? <ExamMonitoringPage /> : <InvigilationOverviewPage />;

  if (role === 'INVIGILATOR') return <InvigilatorLayout>{page}</InvigilatorLayout>;
  if (role && STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])) {
    return <StaffLayout>{page}</StaffLayout>;
  }
  return <Navigate to="/unauthorized" replace />;
}