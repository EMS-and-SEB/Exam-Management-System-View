import { z } from "zod";

export const loginSchema = z.object({
  studentId: z.string().min(1, "Student ID is required."),
  otp: z
    .string()
    .min(1, "OTP code is required.")
    .regex(/^\d{6}$/, "Enter the 6-digit OTP code."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;