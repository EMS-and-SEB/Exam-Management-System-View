import { useNavigate } from 'react-router-dom';
import { Layers, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { useCourses } from '@/modules/course/hooks';
import { useCohorts } from '@/modules/cohorts/hooks';
import { useStaff } from '@/modules/staff/hooks';
import { AddStaffDrawer } from '@/modules/staff/AddStaffDrawer';
import { CourseFormDrawer } from '@/modules/course/CourseFormDrawer';
import { CohortFormDrawer } from '@/modules/cohorts/CohortFormDrawer';
import { StaffDetailDrawer } from '@/modules/staff/StaffDetailDrawer';
import type { StaffMember } from '@/modules/staff/api';

interface RecentItem {
  id: string;
  label: string;
  sublabel: string;
  createdAt: string;
  href: string;
  staff?: StaffMember;
}

interface AdminDashboardProps {
  activeDrawer: 'staff' | 'course' | 'cohort' | null;
  setActiveDrawer: Dispatch<SetStateAction<'staff' | 'course' | 'cohort' | null>>;
}

export function AdminDashboard({ activeDrawer, setActiveDrawer }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
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
      id: s.id, label: s.name, sublabel: 'Staff account created', createdAt: s.createdAt, href: '/staff', staff: s,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  if (isLoading) return <LoadingState label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Courses" value={courses?.length ?? 0} icon={BookOpen} />
        <StatCard label="Total Cohorts" value={cohorts?.length ?? 0} icon={Layers} />
        <StatCard label="Total Staff" value={staffData?.total ?? 0} icon={Users} />
        <StatCard label="Active Staff" value={staffData?.staff.filter((s) => s.isActive).length ?? 0} icon={GraduationCap} tone="success" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium tracking-tight">Recent Activity</p>
          {recentItems.length > 0 && (
            <span className="text-xs text-muted-foreground font-mono">
              {recentItems.length} {recentItems.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>

        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border rounded-xl border-dashed bg-muted/20">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-0.5">Actions and events will appear here once created.</p>
          </div>
        ) : (
          <div className="relative pl-4 space-y-3 before:absolute before:inset-y-2 before:left-[7px] before:w-[-webkit-calc(1px)] before:w-[1px] before:bg-border">
            {recentItems.map((item) => (
              <div key={`${item.sublabel}-${item.id}`} className="relative group">
                <div className="absolute -left-4 top-3.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-muted-foreground/40 group-hover:bg-primary group-hover:scale-110" />

                <div
                  onClick={() => item.staff ? setSelectedStaff(item.staff) : navigate(item.href)}
                  className="group/card relative flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-2xs hover:bg-muted/40 hover:shadow-xs cursor-pointer"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-medium tracking-tight truncate group-hover/card:text-primary">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                      {item.sublabel}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-md">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <svg className="w-4 h-4 text-muted-foreground/50 group-hover/card:text-primary group-hover/card:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
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
      <StaffDetailDrawer
        staff={selectedStaff}
        onOpenChange={(open) => !open && setSelectedStaff(null)}
      />
    </div>
  );
}