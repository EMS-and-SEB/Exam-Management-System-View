import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Loader2, Unlink, BookOpen, Layers, MailPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuthStore } from '@/store/auth.store';
import { useCourses } from '@/modules/course/hooks';
import { useCohorts } from '@/modules/cohorts/hooks';
import {
  useStudent,
  useStudentEnrollments,
  useEnrollStudentInCourse,
  useEnrollStudentInCohort,
  useRemoveStudentFromCourse,
  useRemoveStudentFromCohort,
  useActivateStudent,
} from './hooks';

type SearchResult = { id: string; name: string; type: 'Course' | 'Cohort' };

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const studentDirectoryId = id!;

  const role = useAuthStore((s) => s.user!.role);
  const canManage = role === 'SUPER_ADMIN' || role === 'UNIT_ADMIN';

  const { data: student } = useStudent(studentDirectoryId);
  const { data: enrollments, isLoading: enrollmentsLoading } = useStudentEnrollments(studentDirectoryId);
  const { data: courses } = useCourses(canManage);
  const { data: cohorts } = useCohorts(canManage);

  const [search, setSearch] = useState('');
  const [activationOpen, setActivationOpen] = useState(false);
  const [activationEmail, setActivationEmail] = useState('');
  const activateStudent = useActivateStudent();

  const enrollInCourse = useEnrollStudentInCourse(studentDirectoryId, student?.studentId ?? '');
  const enrollInCohort = useEnrollStudentInCohort(studentDirectoryId, student?.studentId ?? '');
  const removeFromCourse = useRemoveStudentFromCourse(studentDirectoryId, student?.studentId ?? '');
  const removeFromCohort = useRemoveStudentFromCohort(studentDirectoryId, student?.studentId ?? '');

  const enrolledCourseIds = new Set((enrollments?.courses ?? []).map((c) => c.id));
  const enrolledCohortIds = new Set((enrollments?.cohorts ?? []).map((c) => c.id));

  const searchResults: SearchResult[] =
    search.length === 0
      ? []
      : [
          ...(courses ?? [])
            .filter((c) => !enrolledCourseIds.has(c.id) && c.name.toLowerCase().includes(search.toLowerCase()))
            .map((c) => ({ id: c.id, name: c.name, type: 'Course' as const })),
          ...(cohorts ?? [])
            .filter((c) => !enrolledCohortIds.has(c.id) && c.name.toLowerCase().includes(search.toLowerCase()))
            .map((c) => ({ id: c.id, name: c.name, type: 'Cohort' as const })),
        ];

  const handleEnroll = (result: SearchResult) => {
    if (!student) return;
    if (result.type === 'Course') {
      enrollInCourse.mutate({ courseId: result.id, name: student.name }, { onSuccess: () => setSearch('') });
    } else {
      enrollInCohort.mutate({ cohortId: result.id, name: student.name }, { onSuccess: () => setSearch('') });
    }
  };

  const handleActivation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    activateStudent.mutate(
      { id: studentDirectoryId, email: activationEmail.trim() },
      { onSuccess: () => { setActivationEmail(''); setActivationOpen(false); } },
    );
  };

  return (
    <div>
      <PageHeader
        title={student?.name ?? 'Student'}
        subtitle={student?.studentId}
        backTo="/students"
        actions={canManage && student && !student.isActive ? (
          <Button onClick={() => setActivationOpen(true)}>
            <MailPlus className="h-4 w-4" />
            Activate Student Account
          </Button>
        ) : undefined}
      />

      {canManage && student?.isActive && (
        <p className="mb-6 text-sm text-muted-foreground">Student portal account is active.</p>
      )}

      <Dialog open={activationOpen} onOpenChange={setActivationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Student Activation Invitation</DialogTitle>
            <DialogDescription>
              Enter the student’s institutional email address. The address is saved to the directory after the student activates the account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleActivation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-activation-email">Institutional email</Label>
              <Input
                id="student-activation-email"
                type="email"
                required
                autoComplete="email"
                value={activationEmail}
                onChange={(event) => setActivationEmail(event.target.value)}
                placeholder="student@aau.edu.et"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActivationOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={activateStudent.isPending}>
                {activateStudent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {canManage && (
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or cohorts to enroll in..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border bg-popover shadow-md divide-y">
              {searchResults.map((result) => (
                <div key={`${result.type}-${result.id}`} className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {result.type === 'Course' ? (
                      <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate text-sm font-medium">{result.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{result.type}</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={enrollInCourse.isPending || enrollInCohort.isPending}
                    onClick={() => handleEnroll(result)}
                  >
                    Enroll
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Courses</h3>
          <div className="space-y-2">
            {enrollmentsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!enrollmentsLoading && (enrollments?.courses.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">Not enrolled in any courses.</p>
            )}
            {enrollments?.courses.map((course) => (
              <EnrollmentRow
                key={course.id}
                name={course.name}
                status={course.status}
                canManage={canManage}
                pending={removeFromCourse.isPending}
                onRemove={() => removeFromCourse.mutate(course.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Cohorts</h3>
          <div className="space-y-2">
            {enrollmentsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!enrollmentsLoading && (enrollments?.cohorts.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">Not a member of any cohorts.</p>
            )}
            {enrollments?.cohorts.map((cohort) => (
              <EnrollmentRow
                key={cohort.id}
                name={cohort.name}
                status={cohort.status}
                canManage={canManage}
                pending={removeFromCohort.isPending}
                onRemove={() => removeFromCohort.mutate(cohort.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function EnrollmentRow({
  name,
  status,
  canManage,
  pending,
  onRemove,
}: {
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
  canManage: boolean;
  pending: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="truncate text-sm font-medium">{name}</span>
        <StatusBadge status={status} />
      </div>
      {canManage && (
        <Button type="button" variant="ghost" size="icon-sm" disabled={pending} onClick={onRemove} title="Remove">
          {pending ? <Loader2 className="animate-spin" /> : <Unlink />}
        </Button>
      )}
    </div>
  );
}
