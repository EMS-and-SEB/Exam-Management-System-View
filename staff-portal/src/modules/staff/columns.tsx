import type { ColumnDef } from '@tanstack/react-table';
import { MoreVertical, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { staffRoleOptions } from './validation/staff.schema';
import type { StaffMember } from './api';

const ROLE_LABELS = Object.fromEntries(staffRoleOptions.map((r) => [r.value, r.label]));

interface GetColumnsArgs {
  onEdit: (staff: StaffMember) => void;
}

export function getStaffColumns({ onEdit }: GetColumnsArgs): ColumnDef<StaffMember, unknown>[] {
  return [
    {
      id: 'name',
      header: 'Staff Member',
      cell: ({ row }) => {
        const staff = row.original;
        const initials = staff.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{staff.name}</p>
              <p className="text-xs text-muted-foreground">{staff.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => ROLE_LABELS[row.original.role],
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} />,
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