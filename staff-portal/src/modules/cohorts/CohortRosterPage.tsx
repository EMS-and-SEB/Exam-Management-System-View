import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { AddToRosterDrawer } from '@/components/shared/AddToRosterDrawer';
import { getRosterColumns, type RosterRow } from '@/components/shared/rosterColumns';
import {
  useCohort, useMembers, useAddOne, useAddSelected, useAddBulk, useRemoveMember,
} from './hooks';

export function CohortRosterPage() {
  const { id } = useParams<{ id: string }>();
  const cohortId = id!;

  const { data: cohort } = useCohort(cohortId);
  const { data: members, isLoading } = useMembers(cohortId);
  const addOne = useAddOne(cohortId);
  const addSelected = useAddSelected(cohortId);
  const addBulk = useAddBulk(cohortId);
  const removeMember = useRemoveMember(cohortId);

  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RosterRow | null>(null);

  const rows: RosterRow[] = (members ?? []).map((m) => ({
    id: m.studentId,
    studentId: m.student.studentId,
    studentName: m.student.name,
    addedAt: m.createdAt,
  }));

  const columns = getRosterColumns(setRemoveTarget);

  return (
    <div>
      <PageHeader
        title={cohort?.name ?? 'Cohort'}
        badge={cohort?.status}
        backTo="/cohorts"
        actions={<Button onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4" />Add Student</Button>}
      />

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
        <StatCard label="Members" value={rows.length} icon={Users} />
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="No members yet." />

      <AddToRosterDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        entityLabel="Cohort"
        enrolledStudentIds={rows.map((row) => row.id)}
        onAddOne={(data, opts) => addOne.mutate(data, opts)}
        onAddSelected={(ids, opts) => addSelected.mutate(ids, opts)}
        onAddBulk={(file) => addBulk.mutate(file)}
        isAddingOne={addOne.isPending}
        isAddingSelected={addSelected.isPending}
        isAddingBulk={addBulk.isPending}
        bulkResult={addBulk.data}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove student from cohort?"
        description={`${removeTarget?.studentName} will be removed from this cohort. Any existing exam history for this cohort will be kept.`}
        confirmLabel="Remove from cohort"
        variant="destructive"
        isLoading={removeMember.isPending}
        onConfirm={() => removeTarget && removeMember.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) })}
      />
    </div>
  );
}