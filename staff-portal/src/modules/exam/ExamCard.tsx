import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { examTypeOptions } from './validation/exam.schema';
import type { Exam } from './api';

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  const navigate = useNavigate();
  const typeLabel = examTypeOptions.find((t) => t.value === exam.examType)?.label;
  const parentLabel = exam.course?.name ?? exam.cohort?.name;

  return (
    <Card className="hover:border-primary/50 cursor-pointer" onClick={() => navigate(`/exams/${exam.id}`)}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={exam.examType} label={typeLabel} />
            <StatusBadge status={exam.status} />
          </div>
          <p className="font-medium truncate">{exam.title}</p>
          <p className="text-xs text-muted-foreground truncate">{parentLabel}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {exam.scheduledStart && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(exam.scheduledStart), 'MMM d, h:mm a')}
              </span>
            )}
            {exam.durationMinutes && <span>{exam.durationMinutes} min</span>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/exams/${exam.id}`); }}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}