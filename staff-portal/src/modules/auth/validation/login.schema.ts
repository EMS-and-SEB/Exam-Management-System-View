import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().refine(
    (identifier) => /^UGR\/\d{4}\/\d{2}$/i.test(identifier.trim()) || z.string().email().safeParse(identifier).success,
    'Enter a valid staff email address or student ID (UGR/1234/12).',
  ),
  password: z.string().min(1, 'Password is required.'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
