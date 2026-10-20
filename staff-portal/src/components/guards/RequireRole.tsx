import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export function RequireRole({ roles }: { roles: string[] }) {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return <Navigate to="/login" replace />;
  if (roles.includes(role)) return <Outlet />;
  return <Navigate to={role === 'STUDENT' ? '/student-dashboard' : '/unauthorized'} replace />;
}
