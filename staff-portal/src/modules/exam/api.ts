import { http } from "@/lib/axios";

export type ExamStatus = "DRAFT" | "RELEASED" | "CLOSED";
export type ExamType = "QUIZ" | "MIDTERM" | "FINAL" | "MOCK_EXIT";

export interface Exam {
  id: string;
  examType: ExamType;
  title: string;
  courseId: string | null;
  cohortId: string | null;
  durationMinutes: number | null;
  scheduledStart: string | null;
  status: ExamStatus;
  releasedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  pendingGradingCount?: number;
  course?: { name: string };
  cohort?: { name: string };
}

export interface ExamQuestionLink {
  id: string;
  sourceQuestionId: string | null;
  type: string;
  prompt: string;
  points: number;
  order: number;
}

interface RosterEntry {
  id: string;
  status: string;
  startedAt: string | null;
  endsAt: string | null;
  submittedAt: string | null;
  student: { studentId: string; name: string };
}

export const examApi = {
  list: () => http.get<Exam[]>("/exams").then((r) => r.data),
  getOne: (id: string) => http.get<Exam>(`/exams/${id}`).then((r) => r.data),
  create: (data: {
    examType: ExamType;
    title: string;
    courseId?: string;
    cohortId?: string;
    durationMinutes: number;
    scheduledStart: Date;
  }) => http.post<Exam>("/exams", data).then((r) => r.data),
  update: (
    id: string,
    data: { title?: string; durationMinutes?: number; scheduledStart?: Date },
  ) => http.patch<Exam>(`/exams/${id}`, data).then((r) => r.data),
  remove: (id: string) => http.delete(`/exams/${id}`),

  listQuestions: (id: string) =>
    http.get<ExamQuestionLink[]>(`/exams/${id}/questions`).then((r) => r.data),
  attachQuestions: (id: string, questionIds: string[]) =>
    http
      .post<{
        questions: ExamQuestionLink[];
      }>(`/exams/${id}/questions`, { questionIds })
      .then((r) => r.data),
  detachQuestion: (id: string, questionId: string) =>
    http.delete(`/exams/${id}/questions/${questionId}`),

  assignInvigilator: (id: string, invigilatorId: string) =>
    http
      .post(`/exams/${id}/invigilators`, { invigilatorId })
      .then((r) => r.data),
  removeInvigilator: (id: string, staffId: string) =>
    http.delete(`/exams/${id}/invigilators/${staffId}`),

  release: (id: string) =>
    http
      .post<{ exam: Exam; otpExpiresAt: string }>(`/exams/${id}/release`)
      .then((r) => r.data),
  close: (id: string) =>
    http.post<Exam>(`/exams/${id}/close`).then((r) => r.data),

  getOtp: (id: string) =>
    http
      .get<{ otp: string; expiresAt: string }>(`/exams/${id}/otp`)
      .then((r) => r.data),
  getRoster: (id: string) =>
    http.get<RosterEntry[]>(`/exams/${id}/roster`).then((r) => r.data),
};
