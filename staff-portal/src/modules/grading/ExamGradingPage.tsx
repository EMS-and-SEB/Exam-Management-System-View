import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useExam } from '@/modules/exam/hooks';
import { useExamSessions } from './hooks';
import { GradeStudentDrawer } from './GradeStudentDrawer';
import type { SessionSummary } from './api';
import type { ColumnDef } from '@tanstack/react-table';

export function ExamGradingPage() {
  const { id } = useParams<{ id: string }>();
  const examId = id!;

  const { data: exam } = useExam(examId);
  const { data: sessions, isLoading } = useExamSessions(examId);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const sortedSessions = sessions ?? [];
  const gradedCount = sortedSessions.filter((s) => !s.needsGrading).length;

  const columns: ColumnDef<SessionSummary, unknown>[] = [
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
    { id: 'auto', header: 'Auto Score', cell: ({ row }) => `${row.original.autoScore} / ${row.original.maxScore}` },
    { id: 'manual', header: 'Manual', cell: ({ row }) => row.original.manualScore ?? '—' },
    { id: 'total', header: 'Total', cell: ({ row }) => `${row.original.totalScore} / ${row.original.maxScore}` },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.needsGrading ? 'NEEDS_GRADING' : 'GRADED'} />,
    },
    {
      id: 'action',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" onClick={() => setActiveSessionId(row.original.id)}>
          {row.original.needsGrading ? 'Grade' : 'Review'}
        </Button>
      ),
    },
  ];

  const sessionIds = sortedSessions.map((s) => s.id);

  return (
    <div>
      <PageHeader
        title={exam?.title ?? 'Grading'}
        backTo="/grading"
        subtitle={exam ? `${exam.course?.name ?? exam.cohort?.name}` : undefined}
      />

      <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg">
        <StatCard label="Total" value={sortedSessions.length} />
        <StatCard label="Graded" value={gradedCount} tone="success" />
        <StatCard label="Needs Grading" value={sortedSessions.length - gradedCount} tone="warning" />
      </div>

      <DataTable columns={columns} data={sortedSessions} isLoading={isLoading} emptyMessage="No submissions yet." />

      <GradeStudentDrawer
        examId={examId}
        sessionId={activeSessionId}
        sessionIds={sessionIds}
        onOpenChange={(open) => !open && setActiveSessionId(null)}
        onNavigate={setActiveSessionId}
      />
    </div>
  );
}