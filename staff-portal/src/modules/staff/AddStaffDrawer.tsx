import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { createStaffSchema, staffRoleOptions, type CreateStaffValues } from './validation/staff.schema';
import { useCreateStaff } from './hooks';

interface AddStaffDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStaffDrawer({ open, onOpenChange }: AddStaffDrawerProps) {
  const createStaff = useCreateStaff();
  const form = useForm<CreateStaffValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { name: '', email: '', role: 'INSTRUCTOR' },
  });

  const onSubmit = (values: CreateStaffValues) => {
    createStaff.mutate(values, {
      onSuccess: () => {
        form.reset();
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
            Staff accounts are provisioned directly by the Exam Administrator. Staff members
            do not self-register and will receive access instructions to set their password.
          </AlertDescription>
        </Alert>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Full Name</FieldLabel>
          <Input placeholder="e.g. Dr. Sara Jenkins" {...form.register('name')} />
          {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel>Institutional Email</FieldLabel>
          <Input placeholder="s.jenkins@university.edu" {...form.register('email')} />
          {form.formState.errors.email && <FieldError errors={[form.formState.errors.email]} />}
        </Field>

        <Field>
          <FieldLabel>System Role &amp; Access Level</FieldLabel>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-2">
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
      </form>
    </DrawerShell>
  );
}