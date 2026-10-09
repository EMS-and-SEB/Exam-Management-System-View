import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuthStore } from '@/store/auth.store';
import { useScopedOrgUnits } from '@/modules/org-units/hooks';
import { useCohorts, useUpdateCohort } from './hooks';
import { getCohortColumns } from './columns';
import { CohortFormDrawer } from './CohortFormDrawer';
import type { Cohort } from './api';

type StatusOption = 'ALL' | 'ACTIVE' | 'ARCHIVED';

export function CohortListPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user!.role);
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = isSuperAdmin || role === 'UNIT_ADMIN';

  const { data: cohorts, isLoading } = useCohorts();
  const { data: orgUnits } = useScopedOrgUnits(isAdmin);
  const updateCohort = useUpdateCohort();

  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusOption>('ALL');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Cohort | null>(null);

  const filteredCohorts = (cohorts ?? []).filter((cohort) => {
    if (search && !cohort.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (isSuperAdmin && unitFilter !== 'ALL' && cohort.orgUnitId !== unitFilter) return false;
    if (statusFilter !== 'ALL' && cohort.status !== statusFilter) return false;
    return true;
  });

  const columns = getCohortColumns({
    viewerRole: role,
    onEdit: (cohort) => { setEditingCohort(cohort); setFormOpen(true); },
    onToggleArchive: setArchiveTarget,
  });

  const confirmArchive = () => {
    if (!archiveTarget) return;
    updateCohort.mutate(
      { id: archiveTarget.id, data: { status: archiveTarget.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' } },
      { onSuccess: () => setArchiveTarget(null) },
    );
  };

  return (
    <div>
      <PageHeader
        title="Cohorts"
        badge={cohorts ? `${filteredCohorts.length} of ${cohorts.length}` : undefined}
        subtitle={isAdmin ? 'Create cohorts and assign coordinators.' : 'Cohorts assigned to you.'}
        actions={
          isAdmin ? (
            <Button onClick={() => { setEditingCohort(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Create Cohort
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cohorts (e.g. 2026 CS)..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {isSuperAdmin && (
            <select
              className="rounded-md border px-3 py-2 text-sm bg-background"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            >
              <option value="ALL">All Units</option>
              {orgUnits?.filter((unit) => unit.parentId !== null).map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          )}

          <select
            className="rounded-md border px-3 py-2 text-sm bg-background"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusOption)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCohorts}
        isLoading={isLoading}
        emptyMessage="No cohorts found."
        onRowClick={(cohort) => navigate(`/cohorts/${cohort.id}`)}
      />

      <CohortFormDrawer open={formOpen} onOpenChange={setFormOpen} cohort={editingCohort} />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title={archiveTarget?.status === 'ARCHIVED' ? 'Unarchive cohort?' : 'Archive cohort?'}
        description={
          archiveTarget?.status === 'ARCHIVED'
            ? 'This cohort will become active again and can accept new members and exams.'
            : 'This cohort will become read-only — no new members, questions, or exams can be created.'
        }
        confirmLabel={archiveTarget?.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
        variant={archiveTarget?.status === 'ARCHIVED' ? 'default' : 'destructive'}
        isLoading={updateCohort.isPending}
        onConfirm={confirmArchive}
      />
    </div>
  );
}