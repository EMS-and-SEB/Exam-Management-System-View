import type { StaffRole } from "@/types/role";
import { z } from "zod";

export const staffRoleOptions: {
  value: StaffRole;
  label: string;
  description: string;
}[] = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description:
      "Full control within their own org unit and everything beneath it, including creating any other staff.",
  },
  {
    value: "UNIT_ADMIN",
    label: "Unit Admin",
    description:
      "Manages courses, cohorts, instructor and invigilator assignment, and enrollment for one org unit.",
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

export const createStaffSchema = z
  .object({
    name: z.string().min(1, "Full name is required."),
    email: aauEmail,
    role: z.enum([
      "SUPER_ADMIN",
      "UNIT_ADMIN",
      "INSTRUCTOR",
      "INVIGILATOR",
      "EXIT_EXAM_COORDINATOR",
    ]),
    orgUnitId: z.string().uuid().optional(),
    newOrgUnitName: z.string().min(1).optional(),
  })
  .refine((v) => Boolean(v.orgUnitId) !== Boolean(v.newOrgUnitName), {
    message: "Choose an existing unit or name a new one.",
    path: ["orgUnitId"],
  });
export type CreateStaffValues = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  name: z.string().min(1, "Full name is required.").optional(),
  email: aauEmail.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateStaffValues = z.infer<typeof updateStaffSchema>;