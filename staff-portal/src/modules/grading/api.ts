import { http } from '@/lib/axios';

export interface SessionSummary {
  id: string;
  studentId: string;
  student: { studentId: string; name: string };
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'FORCE_SUBMITTED' | 'EXPIRED';
  autoScore: number;
  manualScore: number;
  totalScore: number;
  maxScore: number;
  needsGrading: boolean;
}

export interface AnswerDetail {
  id: string;
  examQuestionId: string;
  type: string;
  prompt: string;
  points: number;
  responseData: unknown;
  correctAnswer?: unknown;
  isCorrect: boolean | null;
  pointsAwarded: number | null;
  gradedAt: string | null;
}

export interface SessionAnswers {
  session: { id: string; studentId: string; student: { name: string; studentId: string } };
  answers: AnswerDetail[];
}

export const gradingApi = {
  listSessionsForExam: (examId: string) =>
    http.get<SessionSummary[]>(`/exams/${examId}/sessions`).then((r) => r.data),

  getSessionAnswers: (sessionId: string) =>
    http.get<SessionAnswers>(`/sessions/${sessionId}/answers`).then((r) => r.data),

  gradeAnswer: (answerId: string, data: { pointsAwarded: number; isCorrect?: boolean }) =>
    http.patch<AnswerDetail>(`/answers/${answerId}/grade`, data).then((r) => r.data),
};