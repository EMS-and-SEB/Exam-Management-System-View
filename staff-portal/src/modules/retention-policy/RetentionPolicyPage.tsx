import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import {
  updateRetentionPolicySchema, type UpdateRetentionPolicyValues,
} from './validation/retention-policy.schema';
import { useRetentionPolicy, useUpdateRetentionPolicy } from './hooks';

export function RetentionPolicyPage() {
  const { data: policy, isLoading } = useRetentionPolicy();
  const updatePolicy = useUpdateRetentionPolicy();

  const form = useForm<UpdateRetentionPolicyValues>({
    resolver: zodResolver(updateRetentionPolicySchema),
    defaultValues: { resultRetentionDays: 730 },
  });

  useEffect(() => {
    if (policy) form.reset({ resultRetentionDays: policy.resultRetentionDays });
  }, [policy]);

  if (isLoading) return <LoadingState label="Loading retention policy..." />;

  const onSubmit = (values: UpdateRetentionPolicyValues) => updatePolicy.mutate(values);

  return (
    <div className="max-w-lg">
      <PageHeader title="Retention Policy" subtitle="Controls how long exam results are retained system-wide." />

      <Card>
        <CardContent className="p-5 space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This setting applies system-wide and affects how long completed exam results remain accessible.
            </AlertDescription>
          </Alert>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field data-invalid={!!form.formState.errors.resultRetentionDays}>
              <FieldLabel>Result Retention Period (days)</FieldLabel>
              <Input
                type="number"
                min={30}
                {...form.register('resultRetentionDays', { valueAsNumber: true })}
              />
              {form.formState.errors.resultRetentionDays && (
                <FieldError errors={[form.formState.errors.resultRetentionDays]} />
              )}
              <p className="text-xs text-muted-foreground">Minimum 30 days.</p>
            </Field>

            {policy && (
              <p className="text-xs text-muted-foreground">
                Last updated {format(new Date(policy.updatedAt), 'MMM d, yyyy h:mm a')}
              </p>
            )}

            <Button type="submit" disabled={updatePolicy.isPending}>
              {updatePolicy.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}