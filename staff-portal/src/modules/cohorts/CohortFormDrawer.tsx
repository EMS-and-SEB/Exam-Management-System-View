import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useStaffSearch } from '@/modules/staff/hooks';
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
  const createCohort = useCreateCohort();
  const updateCohort = useUpdateCohort();

  const [coordinatorQuery, setCoordinatorQuery] = useState('');
  const debouncedQuery = useDebouncedValue(coordinatorQuery);
  const { data: coordinatorResults, isFetching } = useStaffSearch(debouncedQuery, 'EXIT_EXAM_COORDINATOR');

  const form = useForm<CreateCohortValues>({
    resolver: zodResolver(createCohortSchema),
    defaultValues: {
      name: cohort?.name ?? '',
      coordinatorId: cohort?.coordinatorId ?? '',
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({
        name: cohort?.name ?? '',
        coordinatorId: cohort?.coordinatorId ?? '',
      });
      setCoordinatorQuery('');
    }
    onOpenChange(next);
  };

  const onSubmit = (values: CreateCohortValues) => {
    if (isEdit && cohort) {
      updateCohort.mutate({ id: cohort.id, data: values }, { onSuccess: () => handleOpenChange(false) });
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
          <Input placeholder="e.g. 2026 Computer Science — Exit Cohort" {...form.register('name')} />
          {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
        </Field>

        <Field data-invalid={!!form.formState.errors.coordinatorId}>
          <FieldLabel>Coordinator</FieldLabel>
          <Controller
            control={form.control}
            name="coordinatorId"
            render={({ field }) => (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coordinators..."
                    className="pl-9"
                    value={coordinatorQuery}
                    onChange={(e) => setCoordinatorQuery(e.target.value)}
                  />
                </div>
                {isFetching && <p className="text-xs text-muted-foreground">Searching...</p>}
                {coordinatorResults && coordinatorResults.length > 0 && (
                  <div className="rounded-lg border divide-y max-h-40 overflow-y-auto">
                    {coordinatorResults.map((staff) => (
                      <button
                        type="button"
                        key={staff.id}
                        onClick={() => { field.onChange(staff.id); setCoordinatorQuery(staff.name); }}
                        className="w-full text-left p-2 text-sm hover:bg-muted/50 data-[selected=true]:bg-primary/10"
                        data-selected={field.value === staff.id}
                      >
                        {staff.name} <span className="text-muted-foreground">— {staff.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
          {form.formState.errors.coordinatorId && <FieldError errors={[form.formState.errors.coordinatorId]} />}
        </Field>
      </form>
    </DrawerShell>
  );
}
