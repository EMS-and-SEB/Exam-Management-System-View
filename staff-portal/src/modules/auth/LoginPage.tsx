import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';

import { loginSchema, type LoginFormValues } from './validation/login.schema';
import { useLogin } from './hooks';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

 const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="pt-8 pb-6 px-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>

              <h1 className="text-lg font-semibold">
                EMS Exam Management System
              </h1>

              <p className="text-sm text-muted-foreground mt-1">
                Sign in to access the Staff Portal.
              </p>
            </div>

            <form
              onSubmit={form.handleSubmit((v) => login.mutate(v))}
              className="space-y-4"
            >
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xs font-semibold uppercase tracking-wide">
                      Email
                    </FieldLabel>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                      <Input
                        placeholder="Enter your email"
                        className="pl-9"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-xs font-semibold uppercase tracking-wide">
                        Password
                      </FieldLabel>

                      <Link
                        to="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-9 pr-9"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {login.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {login.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6 pt-4 border-t">
              Staff accounts are provisioned by the Exam Administrator.
              <br />
              Self-registration is unavailable.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Exam Management System (EMS) • Secure Institutional Portal
        </p>
      </div>
    </div>
  );
}