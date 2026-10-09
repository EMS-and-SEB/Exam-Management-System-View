import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Cohort } from './api';
import type { StaffRole } from '@/types/role';

interface GetColumnsArgs {
  viewerRole: StaffRole;
  onEdit: (cohort: Cohort) => void;
  onToggleArchive: (cohort: Cohort) => void;
}

export function getCohortColumns({ viewerRole, onEdit, onToggleArchive }: GetColumnsArgs): ColumnDef<Cohort, unknown>[] {
  const isAdmin = viewerRole === 'SUPER_ADMIN' || viewerRole === 'UNIT_ADMIN';

  const columns: ColumnDef<Cohort, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Cohort Name',
      cell: ({ row }) => <span className="font-medium text-primary">{row.original.name}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
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
        <div className="flex justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
            <Pencil />
          </Button>
          <Button
            variant={row.original.status === 'ARCHIVED' ? 'outline' : 'destructive'}
            size="icon-sm"
            aria-label={row.original.status === 'ARCHIVED' ? 'Unarchive cohort' : 'Archive cohort'}
            title={row.original.status === 'ARCHIVED' ? 'Unarchive cohort' : 'Archive cohort'}
            onClick={() => onToggleArchive(row.original)}
          >
            {row.original.status === 'ARCHIVED' ? <ArchiveRestore /> : <Archive />}
          </Button>
        </div>
      ),
    });
  }

  return columns;
}