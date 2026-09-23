import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/auth.store';
import { AdminDashboard } from './AdminDashboard';
import { StaffDashboard } from './StaffDashboard';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div>
      <PageHeader title={`Welcome back, ${user.name.trim().split(/\s+/).slice(0, 2).join(' ')}`} />
      {user.role === 'EXAM_ADMIN' ? <AdminDashboard /> : <StaffDashboard />}
    </div>
  );
}