import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Loader2, Unlink, Mail, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { updateStaffSchema, staffRoleOptions, type UpdateStaffValues } from './validation/staff.schema';
import { useStaffDetails, useUnassignStaffResource, useUpdateStaff } from './hooks';
import { useAuthStore } from '@/store/auth.store';
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
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isViewingOwnAccount = currentUser?.id === staff.id;

  const updateStaff = useUpdateStaff();
  const unassignResource = useUnassignStaffResource();
  const { data: staffDetails } = useStaffDetails(staff.id);
  const courses = staff.role === 'INSTRUCTOR' ? staffDetails?.courses ?? [] : [];
  const cohorts = staff.role === 'EXIT_EXAM_COORDINATOR' ? staffDetails?.coordinatedCohorts ?? [] : [];
  const assignedResourceCount = courses.length + cohorts.length;
  const hasAssignedResourceSection = staff.role === 'INSTRUCTOR' || staff.role === 'EXIT_EXAM_COORDINATOR';
  const emptyResourceMessage =
    staff.role === 'INSTRUCTOR'
      ? 'No courses assigned.'
      : staff.role === 'EXIT_EXAM_COORDINATOR'
        ? 'No cohorts assigned.'
        : '';
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
        isSuperAdmin ? (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={updateStaff.isPending}>
              {updateStaff.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        )
      }
    >
      <form className="space-y-6">
        {isSuperAdmin ? (
          <div className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-xs">
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Account Profile</h4>
            
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel className="text-xs text-muted-foreground font-medium">Full Name</FieldLabel>
              <Input {...form.register('name')} className="bg-background/85" />
              {form.formState.errors.name && <FieldError errors={[form.formState.errors.name]} />}
            </Field>

            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel className="text-xs text-muted-foreground font-medium">Email</FieldLabel>
              <Input {...form.register('email')} className="bg-background/85" />
              {form.formState.errors.email && <FieldError errors={[form.formState.errors.email]} />}
              <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">
                Changing the email will sign this account out of all active sessions.
              </p>
            </Field>

            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 px-3 py-2.5">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium">Unit</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {staffDetails?.orgUnit?.name ?? '—'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm">
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Account Details</h4>
            
            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 px-3 py-2.5">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium">Full Name</p>
                <p className="text-sm font-medium text-foreground truncate">{staff.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 px-3 py-2.5">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium">Email</p>
                <p className="text-sm font-medium text-foreground truncate">{staff.email}</p>
              </div>
            </div>
          </div>
        )}

        {isSuperAdmin && !isViewingOwnAccount && (
          <Field>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm transition-all hover:border-border">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Account Active</p>
                <p className="text-xs text-muted-foreground">
                  Deactivating will sign this account out of all active sessions.
                </p>
              </div>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-checked:bg-blue-600 dark:data-checked:bg-blue-500"
                  />
                )}
              />
            </div>
          </Field>
        )}

        {hasAssignedResourceSection && (
        <Field>
          <div className="flex items-center justify-between mb-2.5">
            <FieldLabel className="m-0">Assigned Resources</FieldLabel>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {assignedResourceCount} total
            </span>
          </div>

          <div className="space-y-2.5">
            {courses.map((course) => (
              <AssignmentRow 
                key={course.id} 
                label={course.name} 
                type="Course" 
                icon={<BookOpen className="h-3.5 w-3.5 text-blue-500" />}
                pending={unassignResource.isPending} 
                onRemove={() => unassignResource.mutate({ staffId: staff.id, resourceId: course.id, resourceType: 'course' })} 
              />
            ))}
            {cohorts.map((cohort) => (
              <AssignmentRow 
                key={cohort.id} 
                label={cohort.name} 
                type="Cohort" 
                icon={<GraduationCap className="h-3.5 w-3.5 text-emerald-500" />}
                pending={unassignResource.isPending} 
                onRemove={() => unassignResource.mutate({ staffId: staff.id, resourceId: cohort.id, resourceType: 'cohort' })} 
              />
            ))}
            {assignedResourceCount === 0 && (
              <div className="rounded-xl border border-dashed border-border/80 p-6 text-center">
                <p className="text-sm text-muted-foreground">{emptyResourceMessage}</p>
              </div>
            )}
          </div>
        </Field>
        )}
      </form>
    </DrawerShell>
  );
}

function AssignmentRow({ 
  label, 
  type, 
  icon, 
  pending, 
  onRemove 
}: { 
  label: string; 
  type: string; 
  icon: React.ReactNode; 
  pending: boolean; 
  onRemove: () => void 
}) {
  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-3 transition-all hover:bg-card hover:border-border hover:shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background shadow-xs">
          {icon}
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground font-medium">{type}</p>
        </div>
      </div>
      <Button 
        type="button" 
        variant="ghost" 
        size="icon-sm" 
        disabled={pending} 
        onClick={onRemove} 
        title={`Deassign ${type.toLowerCase()}`}
        className="text-muted-foreground opacity-85 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
      </Button>
    </div>
  );
}