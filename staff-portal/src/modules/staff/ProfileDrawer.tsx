import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuthStore } from '@/store/auth.store';
import type { StaffRole } from '@/types/role';
import { useUpdateProfile } from './hooks';
import { staffRoleOptions, updateStaffSchema, type UpdateStaffValues } from './validation/staff.schema';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_LABELS: Record<StaffRole, string> = Object.fromEntries(
  staffRoleOptions.map((role) => [role.value, role.label]),
) as Record<StaffRole, string>;

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();

  if (!user) return null;

  return (
    <ProfileForm
      key={`${user.id}:${user.name}:${user.email}`}
      user={user}
      open={open}
      onOpenChange={onOpenChange}
      isPending={updateProfile.isPending}
      onSubmit={(values) => updateProfile.mutate(values, { onSuccess: () => onOpenChange(false) })}
    />
  );
}

function ProfileForm({
  user,
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: {
  user: { name: string; email: string; role: StaffRole };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (values: UpdateStaffValues) => void;
}) {
  const form = useForm<UpdateStaffValues>({
    resolver: zodResolver(updateStaffSchema.pick({ name: true, email: true })),
    defaultValues: { name: user.name, email: user.email },
  });

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      icon={<User className="h-4 w-4" />}
      title="Your Profile"
      subtitle="Manage your account details."
      footer={(
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </>
      )}
    >
      <form className="space-y-5">
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={user.role} label={ROLE_LABELS[user.role]} />
              <StatusBadge status="ACTIVE" />
            </div>
          </div>
        </div>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel>Full Name</FieldLabel>
          <Input {...form.register('name')} />
          {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel>Email Address</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" type="email" {...form.register('email')} />
          </div>
          {form.formState.errors.email && <FieldError errors={[form.formState.errors.email]} />}
          <p className="text-xs text-muted-foreground">Changing your email will sign you out of other active sessions.</p>
        </Field>
      </form>
    </DrawerShell>
  );
}
