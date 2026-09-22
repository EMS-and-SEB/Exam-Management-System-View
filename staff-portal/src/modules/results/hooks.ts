import { useQuery } from '@tanstack/react-query';
import { resultsApi } from './api';

export function useClosedExams() {
  return useQuery({ queryKey: ['results', 'closed-exams'], queryFn: resultsApi.listClosedExams });
}

export function useExamResults(examId: string) {
  return useQuery({
    queryKey: ['results', 'exam', examId],
    queryFn: () => resultsApi.getExamResults(examId),
    enabled: !!examId,
  });
}

export function useCombinedResults(parent: { courseId?: string; cohortId?: string }) {
  return useQuery({
    queryKey: ['results', 'combined', parent.courseId ?? parent.cohortId],
    queryFn: () => (parent.courseId ? resultsApi.getCourseResults(parent.courseId) : resultsApi.getCohortResults(parent.cohortId!)),
    enabled: !!(parent.courseId || parent.cohortId),
  });
}

export function useClosedExamsForParent(parent: { courseId?: string; cohortId?: string }) {
  return useQuery({
    queryKey: ['results', 'closed-exams', parent.courseId ?? parent.cohortId],
    queryFn: () => resultsApi.listClosedExamsForParent(parent),
    enabled: !!(parent.courseId || parent.cohortId),
    retry: false,
  });
}
