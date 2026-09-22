import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { RosterEntry } from './api';

export const rosterColumns: ColumnDef<RosterEntry, unknown>[] = [
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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'started',
    header: 'Started',
    cell: ({ row }) => (row.original.startedAt ? format(new Date(row.original.startedAt), 'h:mm a') : '—'),
  },
  {
    id: 'incidents',
    header: 'Incidents',
    cell: ({ row }) =>
      row.original.incidents.length > 0 ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          {row.original.incidents.length} incident{row.original.incidents.length > 1 ? 's' : ''}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];