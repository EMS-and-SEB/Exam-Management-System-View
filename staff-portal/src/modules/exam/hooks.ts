import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examApi } from './api';

const EXAMS_KEY = ['exams'] as const;
const examKey = (id: string) => [...EXAMS_KEY, id];
const questionsKey = (id: string) => [...EXAMS_KEY, id, 'questions'];

export function useExams() {
  return useQuery({ queryKey: EXAMS_KEY, queryFn: examApi.list });
}

export function useExam(id: string) {
  return useQuery({ queryKey: examKey(id), queryFn: () => examApi.getOne(id), enabled: !!id });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: examApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEY });
      toast.success('Exam draft created.');
    },
  });
}

export function useUpdateExam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; durationMinutes?: number; scheduledStart?: Date }) => examApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKey(id) });
      toast.success('Exam updated.');
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEY });
      toast.success('Exam deleted.');
    },
  });
}

export function useExamQuestions(id: string) {
  return useQuery({ queryKey: questionsKey(id), queryFn: () => examApi.listQuestions(id), enabled: !!id });
}

export function useAttachQuestions(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionIds: string[]) => examApi.attachQuestions(id, questionIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: questionsKey(id) });
      toast.success(`${data.questions.length} question(s) attached.`);
    },
  });
}

export function useDetachQuestion(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => examApi.detachQuestion(id, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsKey(id) });
      toast.success('Question removed from exam.');
    },
  });
}

export function useAssignInvigilator(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invigilatorId: string) => examApi.assignInvigilator(id, invigilatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKey(id) });
      toast.success('Invigilator assigned.');
    },
  });
}

export function useReleaseExam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => examApi.release(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEY });
      queryClient.invalidateQueries({ queryKey: examKey(id) });
      toast.success('Exam released.');
    },
  });
}

export function useCloseExam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => examApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEY });
      queryClient.invalidateQueries({ queryKey: examKey(id) });
      toast.success('Exam closed.');
    },
  });
}