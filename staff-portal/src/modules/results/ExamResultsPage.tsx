import { useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExam } from '@/modules/exam/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { useExamResults } from './hooks';
import { downloadExamResultsCsv } from './api';
import type { ColumnDef } from '@tanstack/react-table';
import type { ExamSessionResult } from './api';

export function ExamResultsPage() {
  const { examId: routeExamId } = useParams<{ examId: string }>();
  const examId = routeExamId ?? '';

  const { data: exam } = useExam(examId);
  const { data: results, isLoading } = useExamResults(examId);

  const columns: ColumnDef<ExamSessionResult, unknown>[] = [
    {
      id: 'student',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.student.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.student.studentId}</p>
        </div>
      ),
    },
    {
      id: 'auto',
      header: 'Auto',
      cell: ({ row }) => row.original.status === 'NOT_STARTED' ? '-' : row.original.autoScore,
    },
    {
      id: 'manual',
      header: 'Manual',
      cell: ({ row }) => row.original.status === 'NOT_STARTED' ? '-' : row.original.manualScore,
    },
    {
      id: 'total',
      header: 'Total',
      cell: ({ row }) => row.original.status === 'NOT_STARTED' ? (
        <span className="font-medium">-</span>
      ) : (
        <span className="font-medium">{row.original.totalScore} / {row.original.maxScore}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={exam?.title ?? 'Results'}
        backTo="/results"
        subtitle={exam?.course?.name ?? exam?.cohort?.name}
        actions={
          <Button variant="outline" onClick={() => downloadExamResultsCsv(examId)}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />
      {isLoading ? <LoadingState label="Loading results..." /> : (
        <DataTable columns={columns} data={results ?? []} emptyMessage="No submissions." />
      )}
    </div>
  );
}