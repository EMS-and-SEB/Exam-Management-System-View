import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { createStaffSchema, staffRoleOptions, type CreateStaffValues } from './validation/staff.schema';
import { useCreateStaff } from './hooks';
import { useScopedOrgUnits } from '@/modules/org-units/hooks';
import { useAuthStore } from '@/store/auth.store';
import type { StaffRole } from '@/types/role';

interface AddStaffDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStaffDrawer({ open, onOpenChange }: AddStaffDrawerProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [unitMode, setUnitMode] = useState<'existing' | 'new'>('existing');
  const [role, setRole] = useState<StaffRole>(staffRoleOptions[0]?.value ?? 'INSTRUCTOR');
  const isSuperAdminRole = role === 'SUPER_ADMIN';
  const isUnitAdminRole = role === 'UNIT_ADMIN';

  const createStaff = useCreateStaff();
  const { data: orgUnits } = useScopedOrgUnits();
  const assignableOrgUnits = orgUnits?.filter(
    (unit) => unit.parentId !== null && unit.id !== currentUser?.orgUnitId,
  );

  const form = useForm<CreateStaffValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: '',
      email: '',
      role: staffRoleOptions[0]?.value ?? 'INSTRUCTOR',
    },
  });

  const onSubmit = (values: CreateStaffValues) => {
    const payload: CreateStaffValues = isSuperAdminRole
      ? { name: values.name, email: values.email, role: values.role, orgUnitId: currentUser?.orgUnitId }
      : unitMode === 'new' && isUnitAdminRole
        ? { name: values.name, email: values.email, role: values.role, newOrgUnitName: values.newOrgUnitName }
        : { name: values.name, email: values.email, role: values.role, orgUnitId: values.orgUnitId };

    createStaff.mutate(payload, {
      onSuccess: () => {
        form.reset();
        setUnitMode('existing');
        setRole(staffRoleOptions[0]?.value ?? 'INSTRUCTOR');
        onOpenChange(false);
      },
    });
  };

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      icon={<UserPlus className="h-4 w-4" />}
      title="Add New Staff"
      subtitle="Create a staff account and assign system permissions."
      width="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={createStaff.isPending}>
            {createStaff.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Staff Account'}
          </Button>
        </>
      }
    >
      <form className="space-y-5">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Staff members do not self-register and will receive access instructions to set
            their password once their account is created.
          </AlertDescription>
        </Alert>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Full Name</FieldLabel>
          <Input
            placeholder="e.g. Dr. Aklilu Tessema"
            className="focus-visible:ring-1 focus-visible:ring-ring/40"
            {...form.register('name')}
          />
          {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel>Institutional Email</FieldLabel>
          <Input
            placeholder="aklilu@aau.edu.et"
            className="focus-visible:ring-1 focus-visible:ring-ring/40"
            {...form.register('email')}
          />
          {form.formState.errors.email && <FieldError errors={[form.formState.errors.email]} />}
        </Field>

        <Field>
          <FieldLabel>System Role &amp; Access Level</FieldLabel>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setRole(value as StaffRole);
                  if (value !== 'UNIT_ADMIN') {
                    setUnitMode('existing');
                    form.setValue('newOrgUnitName', undefined);
                  }
                }}
                className="space-y-2"
              >
                {staffRoleOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value={option.value} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
        </Field>

        {!isSuperAdminRole && (
          <Field>
            <FieldLabel>{isUnitAdminRole ? 'Unit to Manage' : 'Unit They Belong To'}</FieldLabel>
            {isUnitAdminRole && (
              <RadioGroup
                value={unitMode}
                onValueChange={(v) => {
                  const nextMode = v as 'existing' | 'new';
                  setUnitMode(nextMode);
                  if (nextMode === 'new') {
                    form.setValue('orgUnitId', undefined);
                  } else {
                    form.setValue('newOrgUnitName', undefined);
                  }
                }}
                className="flex gap-4 mb-2"
              >
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="existing" />
                  Existing unit
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem value="new" />
                  New unit
                </label>
              </RadioGroup>
            )}

            {unitMode === 'new' && isUnitAdminRole ? (
              <Input
                placeholder="e.g. Computer Science Department"
                className="focus-visible:ring-1 focus-visible:ring-ring/40"
                {...form.register('newOrgUnitName')}
              />
            ) : (
              <Controller
                control={form.control}
                name="orgUnitId"
                render={({ field }) => (
                  <select
                    className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="" disabled>Select a unit...</option>
                    {assignableOrgUnits?.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                )}
              />
            )}
            {form.formState.errors.orgUnitId && <FieldError errors={[form.formState.errors.orgUnitId]} />}
          </Field>
        )}
      </form>
    </DrawerShell>
  );
}