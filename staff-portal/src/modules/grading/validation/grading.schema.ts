import { z } from 'zod';

export const gradeAnswerSchema = z.object({
  pointsAwarded: z.number().min(0, 'Points cannot be negative.'),
  isCorrect: z.boolean().optional(),
});
export type GradeAnswerValues = z.infer<typeof gradeAnswerSchema>;