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
        <div className="space-y-3">
          {gradable.map((exam) => (
            <Card key={exam.id} className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/grading/${exam.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={exam.status} />
                  </div>
                  <p className="font-medium">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">{exam.course?.name ?? exam.cohort?.name}</p>
                </div>
                <Button variant="outline" size="sm">Open Grading</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}