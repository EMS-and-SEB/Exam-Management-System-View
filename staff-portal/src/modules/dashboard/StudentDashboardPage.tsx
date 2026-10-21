import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { useLogout } from '@/modules/auth/hooks';
import { useAuthStore } from '@/store/auth.store';

export function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={`Welcome, ${user?.name ?? 'Student'}`}
          subtitle="Student Portal"
          actions={(
            <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
              Sign Out
            </Button>
          )}
        />
        <Card>
          <CardContent className="flex items-start gap-4 p-6">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold">Student services are coming soon</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Courses, examination schedules, and other student services will appear here when available.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
