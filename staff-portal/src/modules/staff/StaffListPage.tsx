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
import { useAuthStore } from '@/store/auth.store';
import { useScopedOrgUnits } from '@/modules/org-units/hooks';
import type { StaffMember } from './api';

const PAGE_SIZE = 10;
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export function StaffListPage() {
  const currentUser = useAuthStore((s) => s.user);
   const canCreateStaff = currentUser?.role === 'SUPER_ADMIN';

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const canViewStaffDetails = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'UNIT_ADMIN';
  const { data: orgUnits } = useScopedOrgUnits(canCreateStaff);

  const { data, isLoading } = useStaff({
    page: page + 1,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    orgUnitId: selectedOrgUnitId || undefined,
    isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
  });

  const activeCount = data?.staff.filter((s) => s.isActive).length ?? 0;
  const columns = getStaffColumns();

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage staff accounts and their system roles."
        actions={
          canCreateStaff ? (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add New Staff
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <StatCard label="Total Staff" value={data?.total ?? 0} icon={Users} />
        <StatCard label="Active (this page)" value={activeCount} icon={UserCheck} tone="success" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
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
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {canCreateStaff && (
            <select
              aria-label="Filter staff by unit"
              className="rounded-md border px-3 py-2 text-sm bg-background"
              value={selectedOrgUnitId}
              onChange={(e) => {
                setSelectedOrgUnitId(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All units</option>
              {orgUnits?.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          )}

          <select
            aria-label="Filter staff by status"
            className="rounded-md border px-3 py-2 text-sm bg-background"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(0);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.staff ?? []}
        isLoading={isLoading}
        emptyMessage="No staff accounts found."
        onRowClick={canViewStaffDetails ? setEditingStaff : undefined}
        manualPagination={{
          pageIndex: page,
          pageCount: data?.totalPages ?? 0,
          onPageChange: setPage,
        }}
      />

      {canCreateStaff && <AddStaffDrawer open={addOpen} onOpenChange={setAddOpen} />}
      <StaffDetailDrawer staff={editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)} />
    </div>
  );
}