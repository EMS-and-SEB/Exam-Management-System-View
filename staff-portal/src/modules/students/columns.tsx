import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Student } from './api';

interface GetColumnsArgs {
  onEdit: (student: Student) => void;
}

export function getStudentColumns({ onEdit }: GetColumnsArgs): ColumnDef<Student, unknown>[] {
  return [
    {
      id: 'name',
      header: 'Student',
      cell: ({ row }) => {
        const student = row.original;
        const initials = student.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-xs text-muted-foreground">{student.studentId}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Added',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            type="button"
            aria-label={`Edit ${row.original.name}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(row.original);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}
