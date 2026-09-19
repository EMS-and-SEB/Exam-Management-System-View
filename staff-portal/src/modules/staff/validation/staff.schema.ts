import { z } from 'zod';
import type { StaffRole } from '@/types/role';

export const staffRoleOptions: { value: StaffRole; label: string; description: string }[] = [
  { value: 'EXAM_ADMIN', label: 'Exam Administrator', description: 'Full system configuration, courses, cohorts, and comprehensive staff management.' },
  { value: 'INSTRUCTOR', label: 'Instructor', description: 'Manage assigned courses, build test banks, author exams, and grade submissions.' },
  { value: 'INVIGILATOR', label: 'Invigilator', description: 'Monitor live exam sessions, manage classroom OTP access, and record student incidents.' },
  { value: 'EXIT_EXAM_COORDINATOR', label: 'Exit Exam Coordinator', description: 'Oversee departmental exit assessments, university graduation benchmarks, and cohorts.' },
];

export const createStaffSchema = z.object({
  name: z.string().min(1, 'Full name is required.'),
  email: z.string().email('Enter a valid institutional email.'),
  role: z.enum(['EXAM_ADMIN', 'INSTRUCTOR', 'INVIGILATOR', 'EXIT_EXAM_COORDINATOR']),
});
export type CreateStaffValues = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  name: z.string().min(1, 'Full name is required.').optional(),
  email: z.string().email('Enter a valid email.').optional(),
  isActive: z.boolean().optional(),
});
export type UpdateStaffValues = z.infer<typeof updateStaffSchema>;