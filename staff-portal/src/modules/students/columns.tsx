import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreVertical, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
          <DropdownMenu>
            <DropdownMenuTrigger render={<button type="button" aria-label="Row actions" />}>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
