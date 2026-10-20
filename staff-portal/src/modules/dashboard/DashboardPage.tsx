import { useState } from 'react';
import { BookOpen, Layers, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/auth.store';
import { AdminDashboard } from './AdminDashboard';
import { StaffDashboard } from './StaffDashboard';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [activeDrawer, setActiveDrawer] = useState<'staff' | 'course' | 'cohort' | null>(null);
  if (!user) return null;
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'UNIT_ADMIN';

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.trim().split(/\s+/).slice(0, 2).join(' ')}`}
        actions={isAdmin ? (
          <>
            {user.role === 'SUPER_ADMIN' && (
              <Button onClick={() => setActiveDrawer('staff')}>
                <UserPlus className="h-4 w-4" />
                Add Staff
              </Button>
            )}
            <Button variant="outline" onClick={() => setActiveDrawer('course')}>
              <BookOpen className="h-4 w-4 text-destructive dark:text-destructive" />
              Create Course
            </Button>
            <Button variant="outline" onClick={() => setActiveDrawer('cohort')}>
              <Layers className="h-4 w-4 text-primary dark:text-primary" />
              Create Cohort
            </Button>
          </>
        ) : undefined}
      />
      {isAdmin ? (
        <AdminDashboard activeDrawer={activeDrawer} setActiveDrawer={setActiveDrawer} />
      ) : (
        <StaffDashboard />
      )}
    </div>
  );
}