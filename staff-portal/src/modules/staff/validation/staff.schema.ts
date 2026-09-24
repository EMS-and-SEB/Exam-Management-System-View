import type { StaffRole } from "@/types/role";
import { z } from "zod";

export const staffRoleOptions: {
  value: StaffRole;
  label: string;
  description: string;
}[] = [
  {
    value: "EXAM_ADMIN",
    label: "Exam Administrator",
    description:
      "Full system configuration, courses, cohorts, and comprehensive staff management.",
  },
  {
    value: "INSTRUCTOR",
    label: "Instructor",
    description:
      "Manage assigned courses, build test banks, author exams, and grade submissions.",
  },
  {
    value: "INVIGILATOR",
    label: "Invigilator",
    description:
      "Monitor live exam sessions, manage classroom OTP access, and record student incidents.",
  },
  {
    value: "EXIT_EXAM_COORDINATOR",
    label: "Exit Exam Coordinator",
    description:
      "Oversee departmental exit assessments, university graduation benchmarks, and cohorts.",
  },
];

const aauEmail = z
  .string()
  .email("Enter a valid institutional email.")
  .refine((v) => v.toLowerCase().endsWith("@aau.edu.et"), {
    message: "Email must be an @aau.edu.et address.",
  });

export const createStaffSchema = z.object({
  name: z.string().min(1, "Full name is required."),
  email: aauEmail,
  role: z.enum([
    "EXAM_ADMIN",
    "INSTRUCTOR",
    "INVIGILATOR",
    "EXIT_EXAM_COORDINATOR",
  ]),
});
export type CreateStaffValues = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  name: z.string().min(1, "Full name is required.").optional(),
  email: aauEmail.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateStaffValues = z.infer<typeof updateStaffSchema>;
