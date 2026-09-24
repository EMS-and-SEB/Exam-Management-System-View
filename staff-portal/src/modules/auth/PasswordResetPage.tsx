import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  requestResetSchema,
  verifyOtpSchema,
  newPasswordSchema,
  type RequestResetValues,
  type VerifyOtpValues,
  type NewPasswordValues,
} from './validation/password-reset.schema';
import {
  useRequestPasswordReset,
  useVerifyPasswordReset,
  useConfirmPasswordReset,
  useCompleteStaffInvitation,
  useStaffInvitation,
} from './hooks';

type Step = 'request' | 'sent' | 'verify' | 'reset' | 'done';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  const requestReset = useRequestPasswordReset();
  const verifyReset = useVerifyPasswordReset();
  const confirmReset = useConfirmPasswordReset();

  const requestForm = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
  });

  const verifyForm = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: '' },
  });

  const resetForm = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onRequest = (values: RequestResetValues) =>
    requestReset.mutate(values.email, {
      onSuccess: () => {
        setEmail(values.email);
        setStep('sent');
      },
    });

  const onVerify = (values: VerifyOtpValues) =>
    verifyReset.mutate(
      { email, code: values.code },
      {
        onSuccess: (data) => {
          setResetToken(data.resetToken);
          setStep('reset');
        },
      },
    );

  const onReset = (values: NewPasswordValues) =>
    confirmReset.mutate(
      { resetToken, newPassword: values.newPassword },
      { onSuccess: () => setStep('done') },
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-8 pb-6 px-6 space-y-4">
          {step === 'request' && (
            <form
              onSubmit={requestForm.handleSubmit(onRequest)}
              className="space-y-4"
            >
              <div>
                <h1 className="text-lg font-semibold">Reset your password</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a reset code.
                </p>
              </div>

              <Field
                data-invalid={!!requestForm.formState.errors.email}
              >
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...requestForm.register('email')}
                  aria-invalid={!!requestForm.formState.errors.email}
                />
                {requestForm.formState.errors.email && (
                  <FieldError
                    errors={[requestForm.formState.errors.email]}
                  />
                )}
              </Field>

              {requestReset.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {requestReset.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={requestReset.isPending}
              >
                {requestReset.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Send Reset Code'
                )}
              </Button>
            </form>
          )}

          {step === 'sent' && (
            <div className="text-center space-y-4">
              <h1 className="text-lg font-semibold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                If an account exists for <strong>{email}</strong>, a 6-digit
                code has been sent.
              </p>
              <Button
                className="w-full"
                onClick={() => setStep('verify')}
              >
                I have a code
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <form
              onSubmit={verifyForm.handleSubmit(onVerify)}
              className="space-y-4"
            >
              <div>
                <h1 className="text-lg font-semibold">Enter your code</h1>
                <p className="text-sm text-muted-foreground">
                  Sent to {email}
                </p>
              </div>

              <Field
                data-invalid={!!verifyForm.formState.errors.code}
                className="flex flex-col items-center"
              >
                <Controller
                  control={verifyForm.control}
                  name="code"
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!verifyForm.formState.errors.code}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />

                {verifyForm.formState.errors.code && (
                  <FieldError
                    errors={[verifyForm.formState.errors.code]}
                  />
                )}
              </Field>

              {verifyReset.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {verifyReset.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={verifyReset.isPending}
              >
                {verifyReset.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Verify Code'
                )}
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form
              onSubmit={resetForm.handleSubmit(onReset)}
              className="space-y-4"
            >
              <h1 className="text-lg font-semibold">Set a new password</h1>

              <Field
                data-invalid={!!resetForm.formState.errors.newPassword}
              >
                <FieldLabel>New password</FieldLabel>
                <Input
                  type="password"
                  {...resetForm.register('newPassword')}
                  aria-invalid={
                    !!resetForm.formState.errors.newPassword
                  }
                />
                {resetForm.formState.errors.newPassword && (
                  <FieldError
                    errors={[resetForm.formState.errors.newPassword]}
                  />
                )}
              </Field>

              <Field
                data-invalid={!!resetForm.formState.errors.confirmPassword}
              >
                <FieldLabel>Confirm password</FieldLabel>
                <Input
                  type="password"
                  {...resetForm.register('confirmPassword')}
                  aria-invalid={
                    !!resetForm.formState.errors.confirmPassword
                  }
                />
                {resetForm.formState.errors.confirmPassword && (
                  <FieldError
                    errors={[resetForm.formState.errors.confirmPassword]}
                  />
                )}
              </Field>

              {confirmReset.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {confirmReset.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={confirmReset.isPending}
              >
                {confirmReset.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4">
              <h1 className="text-lg font-semibold">Password updated</h1>
              <p className="text-sm text-muted-foreground">
                You can now sign in with your new password.
              </p>
              <Button
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const invitation = useStaffInvitation(token);
  const completeInvitation = useCompleteStaffInvitation();
  const resetForm = useForm<NewPasswordValues>({ resolver: zodResolver(newPasswordSchema) });

  const onSubmit = (values: NewPasswordValues) => {
    completeInvitation.mutate(
      { token, newPassword: values.newPassword },
      { onSuccess: () => navigate('/login', { state: { invitationCompleted: true } }) },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 px-6 space-y-5">
          {invitation.isLoading && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Validating your invitation...</p>
            </div>
          )}

          {(invitation.isError || !token) && !invitation.isLoading && (
            <div className="text-center space-y-3">
              <h1 className="text-lg font-semibold">Invitation unavailable</h1>
              <p className="text-sm text-muted-foreground">
                This invitation is invalid, expired, or has already been used. Ask an Exam Administrator to send a new invitation.
              </p>
              <Button className="w-full" onClick={() => navigate('/login')}>Back to Sign In</Button>
            </div>
          )}

          {invitation.data && (
            <form onSubmit={resetForm.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <h1 className="text-lg font-semibold">Set your password</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {invitation.data.name}. Create a password for {invitation.data.email}.
                </p>
              </div>

              <Field data-invalid={!!resetForm.formState.errors.newPassword}>
                <FieldLabel>New password</FieldLabel>
                <Input type="password" autoComplete="new-password" {...resetForm.register('newPassword')} />
                {resetForm.formState.errors.newPassword && <FieldError errors={[resetForm.formState.errors.newPassword]} />}
              </Field>

              <Field data-invalid={!!resetForm.formState.errors.confirmPassword}>
                <FieldLabel>Confirm password</FieldLabel>
                <Input type="password" autoComplete="new-password" {...resetForm.register('confirmPassword')} />
                {resetForm.formState.errors.confirmPassword && <FieldError errors={[resetForm.formState.errors.confirmPassword]} />}
              </Field>

              {completeInvitation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{completeInvitation.error.message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={completeInvitation.isPending}>
                {completeInvitation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}