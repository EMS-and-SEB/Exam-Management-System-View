import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, ShieldCheck, User, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { loginSchema, type LoginFormValues } from "./validation/login.schema";
import { useLogin, toLoginMessage } from "./hooks";

export function LoginPage() {
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { studentId: "", otp: "" },
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
                Sign in to start your exam.
              </p>
            </div>

            <form
              onSubmit={form.handleSubmit((v) => login.mutate(v))}
              className="space-y-4"
            >
              <Controller
                control={form.control}
                name="studentId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-semibold uppercase tracking-wide"
                    >
                      Student ID
                    </FieldLabel>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                      <Input
                        id={field.name}
                        placeholder="Enter your student ID"
                        className="pl-9"
                        autoComplete="username"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error ? `${field.name}-error` : undefined
                        }
                        {...field}
                      />
                    </div>

                    {fieldState.error && (
                      <div id={`${field.name}-error`}>
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="otp"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-semibold uppercase tracking-wide"
                    >
                      OTP Code
                    </FieldLabel>

                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                      <Input
                        id={field.name}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="Enter your 6-digit code"
                        className="pl-9 tracking-[0.25em]"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error ? `${field.name}-error` : undefined
                        }
                        {...field}
                      />
                    </div>

                    {fieldState.error && (
                      <div id={`${field.name}-error`}>
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  </Field>
                )}
              />

              {login.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{toLoginMessage(login.error)}</AlertDescription>
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
              Your OTP is issued by an invigilator. It is valid for a limited
              window, so enter it once your exam is ready to start.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Exam Management System (EMS) • Secure Student Entry
        </p>
      </div>
    </div>
  );
}