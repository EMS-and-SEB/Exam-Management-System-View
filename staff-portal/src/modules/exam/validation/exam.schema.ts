import { z } from 'zod';

export const examTypeOptions = [
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'MIDTERM', label: 'Midterm' },
  { value: 'FINAL', label: 'Final' },
  { value: 'MOCK_EXIT', label: 'Mock Exit' },
] as const;

export const createExamSchema = z.object({
  examType: z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'MOCK_EXIT']),
  title: z.string().min(1, 'Exam title is required.'),
  courseId: z.string().uuid().optional(),
  cohortId: z.string().uuid().optional(),
  durationMinutes: z.number().int().positive('Duration must be a positive number of minutes.'),
  scheduledStart: z.coerce.date({ message: 'A scheduled start date/time is required.' }),
}).refine((data) => !!data.courseId !== !!data.cohortId, {
  message: 'Exactly one of course or cohort must be selected.', path: ['courseId'],
});
export type CreateExamValues = z.infer<typeof createExamSchema>;

export const updateExamSchema = z.object({
  title: z.string().min(1).optional(),
  durationMinutes: z.number().int().positive().optional(),
  scheduledStart: z.coerce.date().optional(),
});
export type UpdateExamValues = z.infer<typeof updateExamSchema>;