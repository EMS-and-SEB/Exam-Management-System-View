import { z } from 'zod';

export const requestResetSchema = z.object({ email: z.string().email('Enter a valid email address.') });
export const verifyOtpSchema = z.object({ code: z.string().length(6, 'Enter the 6-digit code.') });
export const newPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RequestResetValues = z.infer<typeof requestResetSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;