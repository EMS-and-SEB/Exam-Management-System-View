import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { coursesApi } from './api';

const COURSES_KEY = ['courses'] as const;
const enrollmentsKey = (courseId: string) => ['courses', courseId, 'enrollments'];

export function useCourses() {
  return useQuery({ queryKey: COURSES_KEY, queryFn: coursesApi.list });
}

export function useCourse(id: string) {
  return useQuery({ queryKey: [...COURSES_KEY, id], queryFn: () => coursesApi.getOne(id), enabled: !!id });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
      toast.success('Course created.');
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; instructorId?: string; status?: string } }) =>
      coursesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
      toast.success(variables.data.status === 'ARCHIVED' ? 'Course archived.' : 'Course updated.');
    },
  });
}

export function useEnrollments(courseId: string) {
  return useQuery({
    queryKey: enrollmentsKey(courseId),
    queryFn: () => coursesApi.listEnrollments(courseId),
    enabled: !!courseId,
  });
}

export function useEnrollOne(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentId: string; name: string }) => coursesApi.enrollOne(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKey(courseId) });
      toast.success('Student enrolled.');
    },
  });
}

export function useEnrollSelected(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentIds: string[]) => coursesApi.enrollSelected(courseId, studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKey(courseId) });
      toast.success('Students enrolled.');
    },
  });
}

export function useEnrollBulk(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => coursesApi.enrollBulk(courseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKey(courseId) });
      toast.success('Bulk import complete.');
    },
  });
}

export function useRemoveEnrollment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => coursesApi.removeEnrollment(courseId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKey(courseId) });
      toast.success('Student removed from course.');
    },
  });
}