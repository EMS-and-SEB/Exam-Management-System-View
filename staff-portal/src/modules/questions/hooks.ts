import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { questionsApi } from './api';
import type { Question } from './api';
import type { QuestionInput, QuestionType } from './validation/question.schema';

interface ParentRef {
  courseId?: string;
  cohortId?: string;
}

const parentKey = (parent: ParentRef) => ['questions', parent.courseId ?? parent.cohortId];

export function useQuestions(parent: ParentRef) {
  return useQuery<Question[]>({
    queryKey: parentKey(parent),
    queryFn: () => questionsApi.listForParent(parent),
    enabled: !!(parent.courseId || parent.cohortId),
  });
}

export function useCreateQuestions(parent: ParentRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, questions }: { type: QuestionType; questions: QuestionInput[] }) =>
      questionsApi.createMany(parent, type, questions),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: parentKey(parent) });
      toast.success(`${data.questions.length} question(s) added.`);
    },
  });
}

export function useUpdateQuestion(parent: ParentRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuestionInput> }) => questionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentKey(parent) });
      toast.success('Question updated.');
    },
  });
}

export function useDeleteQuestion(parent: ParentRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentKey(parent) });
      toast.success('Question deleted.');
    },
  });
}