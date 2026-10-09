import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { useStaff } from '@/modules/staff/hooks';
import { useScopedOrgUnits } from '@/modules/org-units/hooks';
import { useAuthStore } from '@/store/auth.store';
import { createCohortSchema, type CreateCohortValues } from './validation/cohorts.schema';
import { useCreateCohort, useUpdateCohort } from './hooks';
import type { Cohort } from './api';

interface CohortFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohort?: Cohort | null;
}

export function CohortFormDrawer({ open, onOpenChange, cohort }: CohortFormDrawerProps) {
  return (
    <CohortFormDrawerInner
      key={cohort?.id ?? 'create'}
      open={open}
      onOpenChange={onOpenChange}
      cohort={cohort}
    />
  );
}

function CohortFormDrawerInner({ open, onOpenChange, cohort }: CohortFormDrawerProps) {
  const isEdit = !!cohort;
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const needsOrgUnitPicker = isSuperAdmin;

  const createCohort = useCreateCohort();
  const updateCohort = useUpdateCohort();

  const form = useForm<CreateCohortValues>({
    resolver: zodResolver(createCohortSchema),
    defaultValues: {
      name: cohort?.name ?? '',
      coordinatorId: cohort?.coordinatorId ?? '',
      orgUnitId: cohort?.orgUnitId,
    },
  });
  const orgUnitId = useWatch({ control: form.control, name: 'orgUnitId' });

  const { data: staffData, isLoading: staffLoading } = useStaff({
    page: 1,
    limit: 100,
    role: 'EXIT_EXAM_COORDINATOR',
    orgUnitId: isSuperAdmin ? orgUnitId : undefined,
    enabled: !isSuperAdmin || Boolean(orgUnitId),
  });
  const { data: orgUnits } = useScopedOrgUnits(isSuperAdmin);
  const coordinators = staffData?.staff ?? [];

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({
        name: cohort?.name ?? '',
        coordinatorId: cohort?.coordinatorId ?? '',
        orgUnitId: cohort?.orgUnitId,
      });
    }
    onOpenChange(next);
  };

  const onSubmit = (values: CreateCohortValues) => {
    if (isEdit && cohort) {
      updateCohort.mutate(
        {
          id: cohort.id,
          data: { name: values.name, coordinatorId: values.coordinatorId },
        },
        { onSuccess: () => handleOpenChange(false) },
      );
    } else {
      createCohort.mutate(values, { onSuccess: () => handleOpenChange(false) });
    }
  };

  const isPending = createCohort.isPending || updateCohort.isPending;

  return (
    <DrawerShell
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Layers className="h-4 w-4" />}
      title={isEdit ? 'Edit Cohort' : 'Create Cohort'}
      subtitle={isEdit ? cohort?.name : 'Create a cohort and assign its coordinator.'}
      footerPlacement="inline"
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Cohort'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Cohort Name</FieldLabel>
          <Input placeholder="e.g. 2026 — CS Cohort" {...form.register('name')} />
          <p className="text-xs text-muted-foreground">
            Include the year and unit, using a short unit name where helpful,
            for clear communication.
          </p>
          {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
        </Field>

        {needsOrgUnitPicker && (
          <Field data-invalid={!!form.formState.errors.orgUnitId}>
            <FieldLabel>Unit</FieldLabel>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              disabled={isEdit}
              {...form.register('orgUnitId', {
                onChange: () => form.setValue('coordinatorId', ''),
              })}
            >
              <option value="">Select a unit…</option>
              {orgUnits?.filter((unit) => unit.parentId !== null).map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            {form.formState.errors.orgUnitId && <FieldError errors={[form.formState.errors.orgUnitId]} />}
          </Field>
        )}

        <Field data-invalid={!!form.formState.errors.coordinatorId}>
          <FieldLabel>Coordinator</FieldLabel>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
            disabled={staffLoading || (isSuperAdmin && !orgUnitId)}
            {...form.register('coordinatorId')}
          >
            <option value="">
              {isSuperAdmin && !orgUnitId
                ? 'Select a unit first…'
                : staffLoading
                  ? 'Loading coordinators…'
                  : 'Select a coordinator…'}
            </option>
            {coordinators.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} ({staff.email})
              </option>
            ))}
          </select>
          {form.formState.errors.coordinatorId && <FieldError errors={[form.formState.errors.coordinatorId]} />}
        </Field>
      </form>
    </DrawerShell>
  );
}