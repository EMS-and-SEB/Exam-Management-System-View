import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useExams } from '@/modules/exam/hooks';

export function ExamsToGradePage() {
  const navigate = useNavigate();
  const { data: exams, isLoading } = useExams();

  const gradable = useMemo(
    () => (exams ?? []).filter((e) => e.status === 'RELEASED' || e.status === 'CLOSED'),
    [exams],
  );

  if (isLoading) return <LoadingState label="Loading exams..." />;

  return (
    <div>
      <PageHeader title="Grading" subtitle="Review and grade submissions for released and closed exams." />

      {gradable.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">No exams to grade yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gradable.map((exam) => (
            <Card key={exam.id} className="cursor-pointer transition-colors hover:border-primary/50" onClick={() => navigate(`/grading/${exam.id}`)}>
              <CardContent className="flex min-h-44 flex-col p-5">
                <div className="flex flex-1 flex-col">
                  <div className="mb-3 flex items-center gap-2">
                    <StatusBadge status={exam.status} />
                  </div>
                  <p className="font-medium leading-snug">{exam.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{exam.course?.name ?? exam.cohort?.name}</p>
                </div>
                <Button variant="outline" size="sm" className="mt-5 w-full">Open Grading</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}