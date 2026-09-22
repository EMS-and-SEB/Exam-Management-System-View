import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Layers, BookOpen, Users, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { useCourses } from '@/modules/course/hooks';
import { useCohorts } from '@/modules/cohorts/hooks';
import { useStaff } from '@/modules/staff/hooks';
import { AddStaffDrawer } from '@/modules/staff/AddStaffDrawer';
import { CourseFormDrawer } from '@/modules/course/CourseFormDrawer';
import { CohortFormDrawer } from '@/modules/cohorts/CohortFormDrawer';

interface RecentItem {
  id: string;
  label: string;
  sublabel: string;
  createdAt: string;
  href: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeDrawer, setActiveDrawer] = useState<'staff' | 'course' | 'cohort' | null>(null);
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: cohorts, isLoading: cohortsLoading } = useCohorts();
  const { data: staffData, isLoading: staffLoading } = useStaff({ page: 1, limit: 100 });

  const isLoading = coursesLoading || cohortsLoading || staffLoading;

  const recentItems: RecentItem[] = [
    ...(courses ?? []).map((c) => ({
      id: c.id, label: c.name, sublabel: 'Course created', createdAt: c.createdAt, href: `/courses/${c.id}`,
    })),
    ...(cohorts ?? []).map((c) => ({
      id: c.id, label: c.name, sublabel: 'Cohort created', createdAt: c.createdAt, href: `/cohorts/${c.id}`,
    })),
    ...(staffData?.staff ?? []).map((s) => ({
      id: s.id, label: s.name, sublabel: 'Staff account created', createdAt: s.createdAt, href: '/staff',
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  if (isLoading) return <LoadingState label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setActiveDrawer('staff')}><UserPlus className="h-4 w-4" />Add Staff</Button>
          <Button variant="outline" onClick={() => setActiveDrawer('course')}><BookOpen className="h-4 w-4" />Create Course</Button>
          <Button variant="outline" onClick={() => setActiveDrawer('cohort')}><Layers className="h-4 w-4" />Create Cohort</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Courses" value={courses?.length ?? 0} icon={BookOpen} />
        <StatCard label="Total Cohorts" value={cohorts?.length ?? 0} icon={Layers} />
        <StatCard label="Total Staff" value={staffData?.total ?? 0} icon={Users} />
        <StatCard label="Active Staff" value={staffData?.staff.filter((s) => s.isActive).length ?? 0} icon={GraduationCap} tone="success" />
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Recent Activity</p>
        {recentItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg border-dashed">Nothing created yet.</p>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <Card key={`${item.sublabel}-${item.id}`} className="cursor-pointer hover:border-primary/50" onClick={() => navigate(item.href)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddStaffDrawer
        open={activeDrawer === 'staff'}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
      />
      <CourseFormDrawer
        open={activeDrawer === 'course'}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
        course={null}
      />
      <CohortFormDrawer
        open={activeDrawer === 'cohort'}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
        cohort={null}
      />
    </div>
  );
}