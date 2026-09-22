import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { useAuthStore } from '@/store/auth.store';
import { useCourses } from '@/modules/course/hooks';
import { useCohorts } from '@/modules/cohorts/hooks';

export function ResultsPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user!.role);
  const isInstructor = role === 'INSTRUCTOR';
  const isAdmin = role === 'EXAM_ADMIN';

  const { data: courses, isLoading: coursesLoading } = useCourses(isInstructor || isAdmin);
  const { data: cohorts, isLoading: cohortsLoading } = useCohorts(!isInstructor || isAdmin);

  const isLoading = isInstructor ? coursesLoading : cohortsLoading;
  const items = isInstructor ? courses : cohorts;

  if (isLoading) return <LoadingState label="Loading..." />;

  return (
    <div>
      <PageHeader title="Results" subtitle={`View exam results for your ${isInstructor ? 'courses' : 'cohorts'}.`} />

      {items?.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          No {isInstructor ? 'courses' : 'cohorts'} yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items?.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:border-primary/50"
              onClick={() => navigate(`/results/${isInstructor ? 'course' : 'cohort'}/${item.id}`)}
            >
              <CardContent className="p-4">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">View exam results</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}