import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, GraduationCap, Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useRequestStudentActivation } from './hooks';
import { studentActivationRequestSchema, type StudentActivationRequestValues } from './validation/student-activation.schema';

export function ActivateAccountPage() {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const requestActivation = useRequestStudentActivation();
  const form = useForm<StudentActivationRequestValues>({
    resolver: zodResolver(studentActivationRequestSchema),
    defaultValues: { studentId: '' },
  });

  const onSubmit = (values: StudentActivationRequestValues) => {
    requestActivation.mutate(values.studentId, { onSuccess: () => setSubmitted(true) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-8 pb-6 px-6">
          {submitted ? (
            <div className="space-y-4 text-center">
              <MailCheck className="mx-auto h-10 w-10 text-primary" />
              <h1 className="text-lg font-semibold">Check your institutional email</h1>
              <p className="text-sm text-muted-foreground">
                If this student ID is eligible for self-service activation, an invitation has been sent to its institutional email address.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-lg font-semibold">Activate Student Account</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your undergraduate student ID to request an activation invitation.
                </p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Field data-invalid={!!form.formState.errors.studentId}>
                  <FieldLabel className="text-xs font-semibold uppercase tracking-wide">Student ID</FieldLabel>
                  <Input
                    autoComplete="username"
                    placeholder="UGR/1234/12"
                    aria-invalid={!!form.formState.errors.studentId}
                    {...form.register('studentId')}
                  />
                  {form.formState.errors.studentId && <FieldError errors={[form.formState.errors.studentId]} />}
                </Field>

                {requestActivation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{requestActivation.error.message}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={requestActivation.isPending}>
                  {requestActivation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Activation'}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <button type="button" onClick={() => navigate('/login')} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
