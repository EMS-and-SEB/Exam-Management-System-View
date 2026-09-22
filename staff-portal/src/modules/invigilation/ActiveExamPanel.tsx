import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Exam } from '@/modules/exam/api';
import type { RosterEntry } from './api';

interface ActiveExamPanelProps {
  exam: Exam;
  roster: RosterEntry[];
}

export function ActiveExamPanel({ exam, roster }: ActiveExamPanelProps) {
  const navigate = useNavigate();

  const counts = {
    total: roster.length,
    inProgress: roster.filter((r) => r.status === 'IN_PROGRESS').length,
    submitted: roster.filter((r) => r.status === 'SUBMITTED' || r.status === 'FORCE_SUBMITTED').length,
    notStarted: roster.filter((r) => r.status === 'NOT_STARTED').length,
    incidents: roster.filter((r) => r.incidents.length > 0).length,
  };

  return (
    <Card className="border-emerald-300 dark:border-emerald-800">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status="IN_PROGRESS" label="Active" />
              {exam.scheduledStart && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(exam.scheduledStart), 'MMM d, h:mm a')} – {exam.durationMinutes} min
                </span>
              )}
            </div>
            <p className="font-semibold">{exam.title}</p>
            <p className="text-xs text-muted-foreground">{exam.course?.name ?? exam.cohort?.name}</p>
          </div>
          <Button onClick={() => navigate(`/invigilation/${exam.id}`)}>
            Monitor Exam <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-6 pt-3 border-t text-sm">
          <div><span className="text-muted-foreground">Total</span> <span className="font-medium ml-1">{counts.total}</span></div>
          <div><span className="text-muted-foreground">In Exam</span> <span className="font-medium ml-1">{counts.inProgress}</span></div>
          <div><span className="text-muted-foreground">Submitted</span> <span className="font-medium ml-1">{counts.submitted}</span></div>
          <div><span className="text-muted-foreground">Not Started</span> <span className="font-medium ml-1">{counts.notStarted}</span></div>
          {counts.incidents > 0 && (
            <div className="text-amber-600 dark:text-amber-400 font-medium ml-auto">{counts.incidents} incidents flagged</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}