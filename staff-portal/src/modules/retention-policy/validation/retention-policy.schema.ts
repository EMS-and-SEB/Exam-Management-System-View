import { z } from 'zod';

export const updateRetentionPolicySchema = z.object({
  resultRetentionDays: z.number().int().min(30, 'Minimum retention period is 30 days.'),
});
export type UpdateRetentionPolicyValues = z.infer<typeof updateRetentionPolicySchema>;