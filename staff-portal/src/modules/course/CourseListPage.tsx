import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuthStore } from '@/store/auth.store';
import { useCourses, useUpdateCourse } from './hooks';
import { getCourseColumns } from './columns';
import { CourseFormDrawer } from './CourseFormDrawer';
import type { Course } from './api';

export function CourseListPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user!.role);
  const { data: courses, isLoading } = useCourses();
  const updateCourse = useUpdateCourse();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Course | null>(null);

  const columns = getCourseColumns({
    viewerRole: role,
    onView: (course) => navigate(`/courses/${course.id}`),
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
        badge={courses ? `${courses.length} Total` : undefined}
        subtitle={role === 'EXAM_ADMIN' ? 'Create courses and assign instructors.' : 'Courses assigned to you.'}
        actions={
          role === 'EXAM_ADMIN' ? (
            <Button onClick={() => { setEditingCourse(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={courses ?? []}
        isLoading={isLoading}
        emptyMessage="No courses found."
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