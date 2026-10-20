import { z } from 'zod';

export const studentActivationRequestSchema = z.object({
  studentId: z.string().trim().regex(/^UGR\/\d{4}\/\d{2}$/i, 'Enter a valid undergraduate student ID (UGR/1234/12).'),
});

export type StudentActivationRequestValues = z.infer<typeof studentActivationRequestSchema>;
