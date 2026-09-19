import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface RosterRow {
  id: string;
  studentId: string;
  studentName: string;
  addedAt: string;
}

export function getRosterColumns(onRemove: (row: RosterRow) => void): ColumnDef<RosterRow, unknown>[] {
  return [
    {
      id: 'name',
      header: 'Student',
      cell: ({ row }) => {
        const r = row.original;
        const initials = r.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <div>
              <p className="font-medium">{r.studentName}</p>
              <p className="text-xs text-muted-foreground">{r.studentId}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'addedAt',
      header: 'Added',
      cell: ({ row }) => format(new Date(row.original.addedAt), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="ghost" size="icon" onClick={() => onRemove(row.original)}>
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}