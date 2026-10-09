import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentsApi } from './api';
import { coursesApi } from '@/modules/course/api';
import { cohortsApi } from '@/modules/cohorts/api';

const STUDENTS_KEY = ['students'] as const;
const enrollmentsKey = (studentDirectoryId: string) => ['students', studentDirectoryId, 'enrollments'];

export function useStudent(id: string) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, id],
    queryFn: () => studentsApi.getOne(id),
    enabled: !!id,
  });
}

export function useStudents(params: { page: number; limit: number; search?: string }) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, params],
    queryFn: () => studentsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useStudentEnrollments(studentDirectoryId: string) {
  return useQuery({
    queryKey: enrollmentsKey(studentDirectoryId),
    queryFn: () => studentsApi.getEnrollments(studentDirectoryId),
    enabled: !!studentDirectoryId,
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

export function useImportStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentsApi.import,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
      toast.success(`Import finished — ${data.created} created, ${data.alreadyExisted} already existed.`);
    },
  });
}

export function useStudentDirectorySearch(query: string, limit = 20) {
  return useQuery({
    queryKey: ['students-directory-search', query, limit],
    queryFn: () => studentsApi.list({ page: 1, limit, search: query }),
    enabled: query.length > 0,
    select: (data) => data.students,
  });
}

export function useEnrollStudentInCourse(studentDirectoryId: string, studentCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, name }: { courseId: string; name: string }) =>
      coursesApi.enrollOne(courseId, { studentId: studentCode, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKey(studentDirectoryId) });
      toast.success('Student enrolled in course.');
    },
  });
}

export function useRemoveStudentFromCourse(studentDirectoryId: string, studentCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => coursesApi.removeEnrollment(courseId, studentCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKey(studentDirectoryId) });
      toast.success('Student removed from course.');
    },
  });
}

export function useEnrollStudentInCohort(studentDirectoryId: string, studentCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cohortId, name }: { cohortId: string; name: string }) =>
      cohortsApi.addOne(cohortId, { studentId: studentCode, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKey(studentDirectoryId) });
      toast.success('Student added to cohort.');
    },
  });
}

export function useRemoveStudentFromCohort(studentDirectoryId: string, studentCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cohortId: string) => cohortsApi.removeMember(cohortId, studentCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKey(studentDirectoryId) });
      toast.success('Student removed from cohort.');
    },
  });
}