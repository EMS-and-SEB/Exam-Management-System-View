import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Info, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  usePurgeExpiredData,
  useRetentionPolicy,
  useUpdateRetentionPolicy,
} from "./hooks";
import {
  updateRetentionPolicySchema,
  type UpdateRetentionPolicyValues,
} from "./validation/retention-policy.schema";

export function RetentionPolicyPage() {
  const { data: policy, isLoading } = useRetentionPolicy();
  const updatePolicy = useUpdateRetentionPolicy();
  const purge = usePurgeExpiredData();
  const [purgeOpen, setPurgeOpen] = useState(false);

  const form = useForm<UpdateRetentionPolicyValues>({
    resolver: zodResolver(updateRetentionPolicySchema),
    defaultValues: { resultRetentionDays: 730 },
  });

  useEffect(() => {
    if (policy) form.reset({ resultRetentionDays: policy.resultRetentionDays });
  }, [policy]);

  if (isLoading) return <LoadingState label="Loading retention policy..." />;

  const onSubmit = (values: UpdateRetentionPolicyValues) =>
    updatePolicy.mutate(values);

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader
        title="Retention Policy"
        subtitle="Controls how long exam results are retained system-wide."
      />

      <Card>
        <CardContent className="p-5 space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This setting applies system-wide and affects how long completed
              exam results remain accessible.
            </AlertDescription>
          </Alert>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field data-invalid={!!form.formState.errors.resultRetentionDays}>
              <FieldLabel>Result Retention Period (days)</FieldLabel>
              <Input
                type="number"
                min={30}
                {...form.register("resultRetentionDays", {
                  valueAsNumber: true,
                })}
              />
              {form.formState.errors.resultRetentionDays && (
                <FieldError
                  errors={[form.formState.errors.resultRetentionDays]}
                />
              )}
              <p className="text-xs text-muted-foreground">Minimum 30 days.</p>
            </Field>

            {policy && (
              <p className="text-xs text-muted-foreground">
                Last updated{" "}
                {format(new Date(policy.updatedAt), "MMM d, yyyy h:mm a")}
              </p>
            )}

            <Button type="submit" disabled={updatePolicy.isPending}>
              {updatePolicy.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-sm font-medium">Manual Purge</p>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently deletes student data (sessions, answers, incidents,
              rosters, OTPs) for closed exams whose retention period has
              elapsed. The exam record is kept and marked as purged.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={() => setPurgeOpen(true)}
            disabled={purge.isPending}
          >
            {purge.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Purge expired data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={purgeOpen}
        onOpenChange={setPurgeOpen}
        title="Purge expired exam data?"
        description="This permanently deletes sessions, answers, incidents, rosters and OTPs for every closed exam whose retention window has elapsed. The exam record will remain but its student data cannot be recovered."
        confirmLabel="Purge"
        variant="destructive"
        isLoading={purge.isPending}
        onConfirm={() => {
          purge.mutate(undefined, { onSuccess: () => setPurgeOpen(false) });
        }}
      />
    </div>
  );
}
