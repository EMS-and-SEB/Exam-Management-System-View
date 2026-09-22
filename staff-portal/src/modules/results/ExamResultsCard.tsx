import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { ExamResultSummary } from './api';

export function ExamResultsCard({ exam }: { exam: ExamResultSummary }) {
  const navigate = useNavigate();

  return (
    <Card className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/results/exam/${exam.id}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={exam.examType} />
          <StatusBadge status="CLOSED" />
        </div>
        <p className="font-medium">{exam.title}</p>
        <p className="text-xs text-muted-foreground">{exam.courseName ?? exam.cohortName}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Closed {format(new Date(exam.closedAt), 'MMM d, yyyy')} · {exam.studentCount} students · {exam.maxScore} points</span>
          <span className="text-primary flex items-center gap-1">View Results <ArrowRight className="h-3 w-3" /></span>
        </div>
      </CardContent>
    </Card>
  );
}