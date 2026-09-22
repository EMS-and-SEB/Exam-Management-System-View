import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useCourses } from '@/modules/course/hooks';
import { useCohorts } from '@/modules/cohorts/hooks';

export function QuestionBankEntryPage() {
  const role = useAuthStore((state) => state.user?.role);
  const isCoordinator = role === 'EXIT_EXAM_COORDINATOR';
  const { data: courses, isLoading: coursesLoading } = useCourses(role === 'INSTRUCTOR');
  const { data: cohorts, isLoading: cohortsLoading } = useCohorts(isCoordinator);
  const items = isCoordinator ? cohorts : courses;
  const isLoading = isCoordinator ? cohortsLoading : coursesLoading;
  const basePath = isCoordinator ? '/cohorts' : '/courses';

  return (
    <div>
      <PageHeader
        title="Question Bank"
        subtitle={'Manage questions for your ' + (isCoordinator ? 'cohorts' : 'courses') + '.'}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="h-auto justify-start gap-3 p-4 text-left"
              render={<Link to={`${basePath}/${item.id}/questions`} />}
            >
              <BookOpen className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="truncate">{item.name}</span>
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          You aren't assigned to any {isCoordinator ? 'cohort' : 'course'}.
        </p>
      )}
    </div>
  );
}