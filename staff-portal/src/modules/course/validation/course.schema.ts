import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required.'),
  instructorId: z.string().uuid('Select an instructor.'),
});
export type CreateCourseValues = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  instructorId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});
export type UpdateCourseValues = z.infer<typeof updateCourseSchema>;