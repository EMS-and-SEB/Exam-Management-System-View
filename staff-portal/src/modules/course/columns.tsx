import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Course } from './api';
import type { StaffRole } from '@/types/role';

interface GetColumnsArgs {
  viewerRole: StaffRole;
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
  onToggleArchive: (course: Course) => void;
}

export function getCourseColumns({ viewerRole, onView, onEdit, onToggleArchive }: GetColumnsArgs): ColumnDef<Course, unknown>[] {
  const isAdmin = viewerRole === 'EXAM_ADMIN';

  const columns: ColumnDef<Course, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Course Name',
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
      id: 'instructor',
      header: 'Instructor',
      cell: ({ row }) => row.original.instructor?.name ?? '—',
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