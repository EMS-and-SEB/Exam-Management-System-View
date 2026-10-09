import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SearchableSelect, type SelectOption } from '@/components/shared/SearchableSelect';
import type { InvigilatorAssignmentExam } from '@/modules/exam/api';
import { examTypeOptions } from '@/modules/exam/validation/exam.schema';

interface GetColumnsArgs {
  invigilatorOptions: SelectOption[];
  savingExamId: string | null;
  onAssign: (examId: string, invigilatorId: string) => void;
}

export function getInvigilatorAssignmentColumns({
  invigilatorOptions,
  savingExamId,
  onAssign,
}: GetColumnsArgs): ColumnDef<InvigilatorAssignmentExam, unknown>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Exam',
      enableSorting: false,
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      id: 'parent',
      header: 'Course / Cohort',
      cell: ({ row }) => row.original.course?.name ?? row.original.cohort?.name ?? '—',
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.examType}
          label={examTypeOptions.find((type) => type.value === row.original.examType)?.label}
        />
      ),
    },
    {
      id: 'starts',
      header: 'Starts',
      cell: ({ row }) =>
        row.original.scheduledStart ? format(new Date(row.original.scheduledStart), 'MMM d, yyyy h:mm a') : '—',
    },
    {
      id: 'invigilator',
      header: 'Invigilator',
      cell: ({ row }) => (
        <SearchableSelect
          value={row.original.invigilator?.id ?? null}
          valueLabel={row.original.invigilator?.name}
          options={invigilatorOptions}
          disabled={savingExamId === row.original.id}
          placeholder="Select invigilator"
          searchPlaceholder="Search staff…"
          emptyMessage="No eligible staff found."
          onChange={(invigilatorId) => onAssign(row.original.id, invigilatorId)}
        />
      ),
    },
  ];
}