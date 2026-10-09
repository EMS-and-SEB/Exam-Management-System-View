import { useQuery } from '@tanstack/react-query';
import { invigilationApi } from './api';

const invigilationQueryMeta = { expectedErrorStatuses: [403] };

function isForbidden(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error.response as { status?: number } | undefined)?.status === 403
  );
}

export function useAssignedExams() {
  return useQuery({
    queryKey: ['invigilation', 'exams'],
    queryFn: invigilationApi.listAssigned,
    meta: invigilationQueryMeta,
  });
}

export function useExamMonitoring(examId: string) {
  const exam = useQuery({
    queryKey: ['invigilation', 'exam', examId],
    queryFn: () => invigilationApi.getExam(examId),
    enabled: !!examId,
    retry: (failureCount, error) => !isForbidden(error) && failureCount < 2,
    meta: invigilationQueryMeta,
  });

  const otp = useQuery({
    queryKey: ['invigilation', 'exam', examId, 'otp'],
    queryFn: () => invigilationApi.getOtp(examId),
    enabled: !!examId && exam.data?.status === 'RELEASED',
    retry: false, // otp visibility window (5 min before start) may reject — don't retry-storm a 403
    meta: invigilationQueryMeta,
  });

  const roster = useQuery({
    queryKey: ['invigilation', 'exam', examId, 'roster'],
    queryFn: () => invigilationApi.getRoster(examId),
    enabled: !!examId,
    retry: (failureCount, error) => !isForbidden(error) && failureCount < 2,
    refetchInterval: (query) => (isForbidden(query.state.error) ? false : 10_000),
    meta: invigilationQueryMeta,
  });

  return {
    exam,
    otp,
    roster,
    accessRevoked: isForbidden(exam.error) || isForbidden(roster.error),
  };
}