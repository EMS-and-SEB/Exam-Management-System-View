import { z } from "zod";

const STUDENT_ID_PATTERN = /^UGR\/\d{4}\/\d{2}$/;

export const createStudentSchema = z.object({
  studentId: z
    .string()
    .min(1, "Student ID is required.")
    .regex(STUDENT_ID_PATTERN, "Student ID must be in the format UGR/1234/12."),
  name: z.string().min(1, "Name is required."),
});
export type CreateStudentValues = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  studentId: z
    .string()
    .min(1, "Student ID is required.")
    .regex(STUDENT_ID_PATTERN, "Student ID must be in the format UGR/1234/12.")
    .optional(),
  name: z.string().min(1, "Name is required.").optional(),
});
export type UpdateStudentValues = z.infer<typeof updateStudentSchema>;
