import { z } from 'zod';

export const createCohortSchema = z.object({
  name: z.string().min(1, 'Cohort name is required.'),
  coordinatorId: z.string().uuid('Select a coordinator.'),
});
export type CreateCohortValues = z.infer<typeof createCohortSchema>;

export const updateCohortSchema = z.object({
  name: z.string().min(1).optional(),
  coordinatorId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});
export type UpdateCohortValues = z.infer<typeof updateCohortSchema>;