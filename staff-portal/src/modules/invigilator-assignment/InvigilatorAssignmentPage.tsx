import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import type { ExamType, InvigilatorAssignmentExam } from '@/modules/exam/api';
import { useAssignInvigilator, useInvigilatorAssignments } from '@/modules/exam/hooks';
import { examTypeOptions } from '@/modules/exam/validation/exam.schema';
import { useStaff } from '@/modules/staff/hooks';
import { getInvigilatorAssignmentColumns } from './columns';
import type { StaffRole } from '@/types/role';

/** Display order: exit exams first, then finals, midterms, quizzes. */
const EXAM_TYPE_ORDER: Record<ExamType, number> = { MOCK_EXIT: 0, FINAL: 1, MIDTERM: 2, QUIZ: 3 };

const TYPE_FILTER_OPTIONS = [...examTypeOptions].sort(
  (a, b) => EXAM_TYPE_ORDER[a.value] - EXAM_TYPE_ORDER[b.value],
);

const ASSIGNABLE_INVIGILATOR_ROLES: StaffRole[] = ['INVIGILATOR', 'INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'];

const startTime = (exam: InvigilatorAssignmentExam) =>
  exam.scheduledStart ? new Date(exam.scheduledStart).getTime() : Number.MAX_SAFE_INTEGER;

const compareExams = (a: InvigilatorAssignmentExam, b: InvigilatorAssignmentExam) =>
  EXAM_TYPE_ORDER[a.examType] - EXAM_TYPE_ORDER[b.examType] || startTime(a) - startTime(b);

export function InvigilatorAssignmentPage() {
  const { data: exams, isLoading } = useInvigilatorAssignments();
  const { data: staffData } = useStaff({ page: 1, limit: 100, role: ASSIGNABLE_INVIGILATOR_ROLES });
  const assignInvigilator = useAssignInvigilator();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ExamType | 'ALL'>('ALL');

  const invigilatorOptions = (staffData?.staff ?? [])
    .filter((staff) => staff.isActive)
    .map((staff) => ({
      value: staff.id,
      label: staff.name,
      hint: `${staff.role.replaceAll('_', ' ')} · ${staff.email}`,
    }));

  const query = search.trim().toLowerCase();
  const visibleExams = (exams ?? [])
    .filter((exam) => typeFilter === 'ALL' || exam.examType === typeFilter)
    .filter(
      (exam) =>
        !query || [exam.title, exam.course?.name, exam.cohort?.name].some((text) => text?.toLowerCase().includes(query)),
    )
    .sort(compareExams);

  const savingExamId = assignInvigilator.isPending ? (assignInvigilator.variables?.examId ?? null) : null;

  const columns = getInvigilatorAssignmentColumns({
    invigilatorOptions,
    savingExamId,
    onAssign: (examId, invigilatorId) => assignInvigilator.mutate({ examId, invigilatorId }),
  });

  return (
    <div>
      <PageHeader
        title="Invigilator Assignment"
        badge={exams ? `${visibleExams.length} of ${exams.length}` : undefined}
        subtitle="Assign or change the invigilator for upcoming exams in your unit."
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by exam, course or cohort..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="rounded-md border px-3 py-2 text-sm bg-background"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ExamType | 'ALL')}
        >
          <option value="ALL">All Types</option>
          {TYPE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={visibleExams}
        isLoading={isLoading}
        emptyMessage="No exams are open for invigilator assignment."
      />
    </div>
  );
}