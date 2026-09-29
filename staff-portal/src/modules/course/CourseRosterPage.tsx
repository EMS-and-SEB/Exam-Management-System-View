import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { AddToRosterDrawer } from '@/components/shared/AddToRosterDrawer';
import { getRosterColumns, type RosterRow } from '@/components/shared/rosterColumns';
import { useAuthStore } from '@/store/auth.store';
import {
  useCourse, useEnrollments, useEnrollOne, useEnrollSelected, useImportEnrollments, useRemoveEnrollment,
} from './hooks';

export function CourseRosterPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = id!;

  const role = useAuthStore((s) => s.user?.role);
  const isInstructor = role === 'INSTRUCTOR';

  const { data: course } = useCourse(courseId);
  const { data: enrollments, isLoading } = useEnrollments(courseId);
  const enrollOne = useEnrollOne(courseId);

  const enrollSelected = useEnrollSelected(courseId);
  const importEnrollments = useImportEnrollments(courseId);
  const removeEnrollment = useRemoveEnrollment(courseId);

  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RosterRow | null>(null);

  const rows: RosterRow[] = (enrollments ?? [])
    .filter((e) => !e.deletedAt)
    .map((e) => ({ id: e.studentId, studentId: e.student.studentId, studentName: e.student.name, addedAt: e.createdAt }));

  const columns = getRosterColumns(setRemoveTarget);

  return (
    <div>
      <PageHeader
        title={course?.name ?? 'Course'}
        badge={course?.status}
        backTo="/courses"
        actions={<Button onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4" />Add Student</Button>}
      />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
        <StatCard label="Enrolled" value={rows.length} icon={Users} />
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="No students enrolled yet." />

      <AddToRosterDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        entityLabel="Course"
        mode={isInstructor ? 'single' : 'full'}
        enrolledStudentIds={rows.map((row) => row.id)}
        onAddOne={(data, opts) => enrollOne.mutate(data, opts)}
        isAddingOne={enrollOne.isPending}
        {...(!isInstructor && {
          onAddSelected: (ids, opts) => enrollSelected.mutate(ids, opts),
          onImport: (file) => importEnrollments.mutate(file),
          isAddingSelected: enrollSelected.isPending,
          isImporting: importEnrollments.isPending,
          importResult: importEnrollments.data,
        })}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove student from course?"
        description={`${removeTarget?.studentName} will be removed from this course's roster. Any existing exam history for this course will be kept.`}
        confirmLabel="Remove from course"
        variant="destructive"
        isLoading={removeEnrollment.isPending}
        onConfirm={() => removeTarget && removeEnrollment.mutate(removeTarget.studentId, { onSuccess: () => setRemoveTarget(null) })}
      />
    </div>
  );
}