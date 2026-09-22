import { useQuery } from '@tanstack/react-query';
import { invigilationApi } from './api';

export function useAssignedExams() {
  return useQuery({ queryKey: ['invigilation', 'exams'], queryFn: invigilationApi.listAssigned });
}

export function useExamMonitoring(examId: string) {
  const exam = useQuery({
    queryKey: ['invigilation', 'exam', examId],
    queryFn: () => invigilationApi.getExam(examId),
    enabled: !!examId,
  });

  const otp = useQuery({
    queryKey: ['invigilation', 'exam', examId, 'otp'],
    queryFn: () => invigilationApi.getOtp(examId),
    enabled: !!examId && exam.data?.status === 'RELEASED',
    retry: false, // otp visibility window (5 min before start) may reject — don't retry-storm a 403
  });

  const roster = useQuery({
    queryKey: ['invigilation', 'exam', examId, 'roster'],
    queryFn: () => invigilationApi.getRoster(examId),
    enabled: !!examId,
    refetchInterval: 10_000, // matches the "Auto-refreshing... 10s" cue in the reference design
  });

  return { exam, otp, roster };
}