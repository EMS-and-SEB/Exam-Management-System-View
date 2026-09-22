import { http } from '@/lib/axios';

export interface ExamResultSummary {
  id: string;
  title: string;
  examType: string;
  status: 'CLOSED';
  closedAt: string;
  studentCount: number;
  maxScore: number;
  courseId: string | null;
  cohortId: string | null;
  courseName?: string;
  cohortName?: string;
}

interface CombinedResultRow {
  studentId: string;
  name: string;
  scores: Record<string, { score: number; maxScore: number } | null>; // keyed by examId
  aggregate: number;
}

interface ExamResultsResponse {
  sessions: ExamSessionResult[];
}

export interface ExamSessionResult {
  studentId: string;
  student: { studentId: string; name: string };
  status: string;
  autoScore: number;
  manualScore: number;
  totalScore: number;
  maxScore: number;
}

export const resultsApi = {
  listClosedExams: () => http.get<ExamResultSummary[]>('/exams').then((r) => r.data.filter((e) => e.status === 'CLOSED')),

  getExamResults: (examId: string) =>
    http
      .get<ExamSessionResult[] | ExamResultsResponse>(`/exams/${examId}/sessions`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data.sessions)),

  exportExamResults: (examId: string) =>
    http.get(`/exams/${examId}/results/export`, { responseType: 'blob' }).then((r) => r.data),

  getCourseResults: (courseId: string) =>
    http.get<CombinedResultRow[]>(`/courses/${courseId}/results`).then((r) => r.data),

  getCohortResults: (cohortId: string) =>
    http.get<CombinedResultRow[]>(`/cohorts/${cohortId}/results`).then((r) => r.data),

  exportUrl: (parent: { courseId?: string; cohortId?: string }) =>
    parent.courseId ? `/courses/${parent.courseId}/results/export` : `/cohorts/${parent.cohortId}/results/export`,

  listClosedExamsForParent: (parent: { courseId?: string; cohortId?: string }) => {
    const params = parent.courseId ? { courseId: parent.courseId } : { cohortId: parent.cohortId };
    return http.get<ExamResultSummary[]>('/exams', { params }).then((r) => r.data.filter((e) => e.status === 'CLOSED'));
    },
};

export const downloadResultsCsv = async (parent: { courseId?: string; cohortId?: string }) => {
  const response = await http.get(resultsApi.exportUrl(parent), { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'results.csv';
  link.click();
  window.URL.revokeObjectURL(url);
};

export const downloadExamResultsCsv = async (examId: string) => {
  const response = await resultsApi.exportExamResults(examId);
  const url = window.URL.createObjectURL(new Blob([response]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `exam-${examId}-results.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};