import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentsApi } from './api';

const STUDENTS_KEY = ['students'] as const;

export function useStudents(params: { page: number; limit: number; search?: string }) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, params],
    queryFn: () => studentsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
      toast.success('Student added to the directory.');
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { studentId?: string; name?: string } }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
      toast.success('Student updated.');
    },
  });
}

export function useBulkImportStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentsApi.bulkImport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
      toast.success(`Import finished — ${data.created} created, ${data.updated} updated.`);
    },
  });
}

export function useStudentDirectorySearch(query: string) {
  return useQuery({
    queryKey: ['students-directory-search', query],
    queryFn: () => studentsApi.list({ page: 1, limit: 20, search: query }),
    enabled: query.length > 0,
    select: (data) => data.students,
  });
}