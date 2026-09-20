import { z } from 'zod';

export const createStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required.'),
  name: z.string().min(1, 'Name is required.'),
});
export type CreateStudentValues = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required.').optional(),
  name: z.string().min(1, 'Name is required.').optional(),
});
export type UpdateStudentValues = z.infer<typeof updateStudentSchema>;