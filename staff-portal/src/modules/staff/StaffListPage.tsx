import { useState } from 'react';
import { Plus, Search, Users, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { useStaff } from './hooks';
import { getStaffColumns } from './columns';
import { AddStaffDrawer } from './AddStaffDrawer';
import { StaffDetailDrawer } from './StaffDetailDrawer';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { StaffMember } from './api';

const PAGE_SIZE = 10;

export function StaffListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [addOpen, setAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const { data, isLoading } = useStaff({
    page: page + 1,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const activeCount = data?.staff.filter((s) => s.isActive).length ?? 0;
  const columns = getStaffColumns({ onEdit: setEditingStaff });

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage staff accounts and their system roles."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New Staff
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <StatCard label="Total Staff" value={data?.total ?? 0} icon={Users} />
        <StatCard label="Active (this page)" value={activeCount} icon={UserCheck} tone="success" />
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.staff ?? []}
        isLoading={isLoading}
        emptyMessage="No staff accounts found."
        onRowClick={setEditingStaff}
        manualPagination={{
          pageIndex: page,
          pageCount: data?.totalPages ?? 0,
          onPageChange: setPage,
        }}
      />

      <AddStaffDrawer open={addOpen} onOpenChange={setAddOpen} />
      <StaffDetailDrawer staff={editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)} />
    </div>
  );
}