import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradingApi } from './api';

const sessionsKey = (examId: string) => ['grading', 'exam', examId, 'sessions'];
const answersKey = (sessionId: string) => ['grading', 'session', sessionId, 'answers'];

export function useExamSessions(examId: string) {
  return useQuery({
    queryKey: sessionsKey(examId),
    queryFn: () => gradingApi.listSessionsForExam(examId),
    enabled: !!examId,
  });
}

export function useSessionAnswers(sessionId: string) {
  return useQuery({
    queryKey: answersKey(sessionId),
    queryFn: () => gradingApi.getSessionAnswers(sessionId),
    enabled: !!sessionId,
  });
}

export function useGradeAnswer(examId: string, sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ answerId, data }: { answerId: string; data: { pointsAwarded: number; isCorrect?: boolean } }) =>
      gradingApi.gradeAnswer(answerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: answersKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKey(examId) });
    },
  });
}