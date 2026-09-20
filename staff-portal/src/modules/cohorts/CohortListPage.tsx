import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuthStore } from '@/store/auth.store';
import { useCohorts, useUpdateCohort } from './hooks';
import { getCohortColumns } from './columns';
import { CohortFormDrawer } from './CohortFormDrawer';
import type { Cohort } from './api';

export function CohortListPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user!.role);
  const { data: cohorts, isLoading } = useCohorts();
  const updateCohort = useUpdateCohort();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Cohort | null>(null);

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
        badge={cohorts ? `${cohorts.length} Total` : undefined}
        subtitle={role === 'EXAM_ADMIN' ? 'Create cohorts and assign coordinators.' : 'Cohorts assigned to you.'}
        actions={
          role === 'EXAM_ADMIN' ? (
            <Button onClick={() => { setEditingCohort(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Create Cohort
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={cohorts ?? []}
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