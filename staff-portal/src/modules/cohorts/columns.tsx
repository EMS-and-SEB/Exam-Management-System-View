import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Cohort } from './api';
import type { StaffRole } from '@/types/role';

interface GetColumnsArgs {
  viewerRole: StaffRole;
  onView: (cohort: Cohort) => void;
  onEdit: (cohort: Cohort) => void;
  onToggleArchive: (cohort: Cohort) => void;
}

export function getCohortColumns({ viewerRole, onView, onEdit, onToggleArchive }: GetColumnsArgs): ColumnDef<Cohort, unknown>[] {
  const isAdmin = viewerRole === 'EXAM_ADMIN';

  const columns: ColumnDef<Cohort, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Cohort Name',
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium text-left text-primary"
          onClick={() => onView(row.original)}
        >
          {row.original.name}
        </button>
      ),
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  if (isAdmin) {
    columns.push({
      id: 'coordinator',
      header: 'Coordinator',
      cell: ({ row }) => row.original.coordinator?.name ?? '—',
    });
    columns.push({
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
            <Pencil />
          </Button>
          <Button
            variant={row.original.status === 'ARCHIVED' ? 'outline' : 'destructive'}
            size="sm"
            onClick={() => onToggleArchive(row.original)}
          >
            {row.original.status === 'ARCHIVED' ? <ArchiveRestore /> : <Archive />}
            {row.original.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
          </Button>
        </div>
      ),
    });
  }

  return columns;
}