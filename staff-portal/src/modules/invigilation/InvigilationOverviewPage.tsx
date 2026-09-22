import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAssignedExams } from './hooks';
import { groupExams } from '@/modules/exam/ExamStatusGroup';
import { ActiveExamPanel } from './ActiveExamPanel';
import { useExamMonitoring } from './hooks';

export function InvigilationOverviewPage() {
  const navigate = useNavigate();
  const { data: exams, isLoading } = useAssignedExams();

  if (isLoading) return <LoadingState label="Loading assigned exams..." />;

  const groups = groupExams(exams ?? []);
  const activeExam = groups.active[0];
  const completed = groups.completed.slice(0, 4);

  return (
    <div>
      <PageHeader title="Invigilation" subtitle="Exams currently taking place or scheduled where you are the assigned proctor." />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <StatCard label="Active Now" value={groups.active.length} tone="success" />
        <StatCard label="Upcoming" value={groups.upcoming.length} />
      </div>

      {activeExam && (
        <div className="mb-6">
          <ActiveExamMonitorEntry examId={activeExam.id} />
        </div>
      )}

      {groups.upcoming.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Upcoming Assigned Exams</p>
          <div className="space-y-2">
            {groups.upcoming.map((exam) => (
              <Card key={exam.id} className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/invigilation/${exam.id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {exam.scheduledStart && format(new Date(exam.scheduledStart), 'MMM d, h:mm a')} · {exam.course?.name ?? exam.cohort?.name}
                    </p>
                  </div>
                  <StatusBadge status={exam.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-3">Recent Invigilation History</p>
        {completed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg border-dashed">No completed sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {completed.map((exam) => (
              <Card key={exam.id} className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/invigilation/${exam.id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">{exam.course?.name ?? exam.cohort?.name}</p>
                  </div>
                  <StatusBadge status={exam.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveExamMonitorEntry({ examId }: { examId: string }) {
  const { exam, roster } = useExamMonitoring(examId);
  if (!exam.data || !roster.data) return null;
  return <ActiveExamPanel exam={exam.data} roster={roster.data} />;
}