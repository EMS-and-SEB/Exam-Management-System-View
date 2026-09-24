import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Loader2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { updateStaffSchema, staffRoleOptions, type UpdateStaffValues } from './validation/staff.schema';
import { useStaffDetails, useUnassignStaffResource, useUpdateStaff } from './hooks';
import type { StaffMember } from './api';

const ROLE_LABELS = Object.fromEntries(staffRoleOptions.map((r) => [r.value, r.label]));

interface StaffDetailDrawerProps {
  staff: StaffMember | null;
  onOpenChange: (open: boolean) => void;
}

export function StaffDetailDrawer({ staff, onOpenChange }: StaffDetailDrawerProps) {
  if (!staff) return null;
  return <StaffDetailForm key={staff.id} staff={staff} onOpenChange={onOpenChange} />;
}

function StaffDetailForm({ staff, onOpenChange }: { staff: StaffMember; onOpenChange: (open: boolean) => void }) {
  const updateStaff = useUpdateStaff();
  const unassignResource = useUnassignStaffResource();
  const { data: staffDetails } = useStaffDetails(staff.id);
  const courses = staffDetails?.courses ?? [];
  const cohorts = staffDetails?.coordinatedCohorts ?? [];
  const form = useForm<UpdateStaffValues>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: { name: staff.name, email: staff.email, isActive: staff.isActive },
  });

  const onSubmit = (values: UpdateStaffValues) => {
    updateStaff.mutate(
      { id: staff.id, data: values, currentIsActive: staff.isActive },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <DrawerShell
      open
      onOpenChange={onOpenChange}
      icon={<User className="h-4 w-4" />}
      title={staff.name}
      subtitle={ROLE_LABELS[staff.role]}
      badge={<StatusBadge status={staff.isActive ? 'ACTIVE' : 'INACTIVE'} />}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={updateStaff.isPending}>
            {updateStaff.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form className="space-y-5">
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Full Name</FieldLabel>
          <Input {...form.register('name')} />
          {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel>Email</FieldLabel>
          <Input {...form.register('email')} />
          {form.formState.errors.email && <FieldError errors={[form.formState.errors.email]} />}
          <p className="text-xs text-muted-foreground">
            Changing the email will sign this account out of all active sessions.
          </p>
        </Field>

        <Field>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Account Active</p>
              <p className="text-xs text-muted-foreground">
                Deactivating will sign this account out of all active sessions.
              </p>
            </div>
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </Field>

        <Field>
          <FieldLabel>Assigned to</FieldLabel>
          <div className="space-y-2">
            {courses.map((course) => (
              <AssignmentRow key={course.id} label={course.name} type="Course" pending={unassignResource.isPending} onRemove={() => unassignResource.mutate({ staffId: staff.id, resourceId: course.id, resourceType: 'course' })} />
            ))}
            {cohorts.map((cohort) => (
              <AssignmentRow key={cohort.id} label={cohort.name} type="Cohort" pending={unassignResource.isPending} onRemove={() => unassignResource.mutate({ staffId: staff.id, resourceId: cohort.id, resourceType: 'cohort' })} />
            ))}
            {courses.length === 0 && cohorts.length === 0 && (
              <p className="text-sm text-muted-foreground">No courses or cohorts assigned.</p>
            )}
          </div>
        </Field>
      </form>
    </DrawerShell>
  );
}

function AssignmentRow({ label, type, pending, onRemove }: { label: string; type: string; pending: boolean; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <Button type="button" variant="ghost" size="icon-sm" disabled={pending} onClick={onRemove} title={`Deassign ${type.toLowerCase()}`}>
        {pending ? <Loader2 className="animate-spin" /> : <Unlink />}
      </Button>
    </div>
  );
}
