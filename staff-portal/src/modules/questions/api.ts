import { http } from '@/lib/axios';
import type { QuestionInput, QuestionType } from './validation/question.schema';

export type Question = {
  id: string;
  courseId: string | null;
  cohortId: string | null;
  createdById: string;
  createdAt: string;
  type: QuestionType;
  prompt: string;
  points: number;
};

interface ParentRef {
  courseId?: string;
  cohortId?: string;
}

export const questionsApi = {
  listForParent: (parent: ParentRef) => {
    const path = parent.courseId ? `/courses/${parent.courseId}/questions` : `/cohorts/${parent.cohortId}/questions`;
    return http.get<Question[]>(path).then((r) => r.data);
  },

  createMany: (parent: ParentRef, type: QuestionType, questions: QuestionInput[]) => {
    const path = parent.courseId ? `/courses/${parent.courseId}/questions` : `/cohorts/${parent.cohortId}/questions`;
    return http.post<{ questions: Question[] }>(path, { type, questions }).then((r) => r.data);
  },

  update: (questionId: string, data: Partial<QuestionInput>) =>
    http.patch<Question>(`/questions/${questionId}`, data).then((r) => r.data),

  remove: (questionId: string) => http.delete(`/questions/${questionId}`),
};