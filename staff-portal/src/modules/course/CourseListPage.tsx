import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuthStore } from '@/store/auth.store';
import { useScopedOrgUnits } from '@/modules/org-units/hooks';
import { useCourses, useUpdateCourse } from './hooks';
import { getCourseColumns } from './columns';
import { CourseFormDrawer } from './CourseFormDrawer';
import type { Course } from './api';

type StatusOption = 'ALL' | 'ACTIVE' | 'ARCHIVED';

export function CourseListPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user!.role);
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = isSuperAdmin || role === 'UNIT_ADMIN';

  const { data: courses, isLoading } = useCourses();
  const { data: orgUnits } = useScopedOrgUnits(isSuperAdmin);
  const updateCourse = useUpdateCourse();

  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusOption>('ALL');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Course | null>(null);

  const filteredCourses = (courses ?? []).filter((course) => {
    if (search && !course.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (isSuperAdmin && unitFilter !== 'ALL' && course.orgUnitId !== unitFilter) return false;
    if (statusFilter !== 'ALL' && course.status !== statusFilter) return false;
    return true;
  });

  const columns = getCourseColumns({
    viewerRole: role,
    onEdit: (course) => { setEditingCourse(course); setFormOpen(true); },
    onToggleArchive: setArchiveTarget,
  });

  const confirmArchive = () => {
    if (!archiveTarget) return;
    updateCourse.mutate(
      { id: archiveTarget.id, data: { status: archiveTarget.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' } },
      { onSuccess: () => setArchiveTarget(null) },
    );
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        badge={courses ? `${filteredCourses.length} of ${courses.length}` : undefined}
        subtitle={isAdmin ? 'Create courses and assign instructors.' : 'Courses assigned to you.'}
        actions={
          isAdmin ? (
            <Button onClick={() => { setEditingCourse(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses (e.g. Data Structures CS201 2026 A)..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {isSuperAdmin && (
            <select
              className="rounded-md border px-3 py-2 text-sm bg-background"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            >
              <option value="ALL">All Units</option>
              {orgUnits?.filter((unit) => unit.parentId !== null).map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          )}

          <select
            className="rounded-md border px-3 py-2 text-sm bg-background"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusOption)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCourses}
        isLoading={isLoading}
        emptyMessage="No courses found."
        onRowClick={(course) => navigate(`/courses/${course.id}`)}
      />

      <CourseFormDrawer open={formOpen} onOpenChange={setFormOpen} course={editingCourse} />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title={archiveTarget?.status === 'ARCHIVED' ? 'Unarchive course?' : 'Archive course?'}
        description={
          archiveTarget?.status === 'ARCHIVED'
            ? 'This course will become active again and can accept new enrollments and exams.'
            : 'This course will become read-only — no new enrollments, questions, or exams can be created.'
        }
        confirmLabel={archiveTarget?.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
        variant={archiveTarget?.status === 'ARCHIVED' ? 'default' : 'destructive'}
        isLoading={updateCourse.isPending}
        onConfirm={confirmArchive}
      />
    </div>
  );
}