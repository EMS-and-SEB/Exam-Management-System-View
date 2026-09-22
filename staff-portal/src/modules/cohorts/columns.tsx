import type { ColumnDef } from '@tanstack/react-table';
import { MoreVertical, Pencil, Archive, ArchiveRestore } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger render={<button type="button" aria-label="Row actions" />}>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleArchive(row.original)}>
                {row.original.status === 'ARCHIVED' ? (
                  <><ArchiveRestore className="mr-2 h-4 w-4" />Unarchive</>
                ) : (
                  <><Archive className="mr-2 h-4 w-4" />Archive</>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    });
  }

  return columns;
}