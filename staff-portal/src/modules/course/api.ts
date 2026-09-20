import { http } from '@/lib/axios';

export interface Course {
  id: string;
  name: string;
  instructorId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  instructor?: { name: string; email: string };
}

interface Enrollment {
  id: string;
  studentId: string;
  deletedAt: string | null;
  createdAt: string;
  student: { studentId: string; name: string };
}

interface BulkEnrollResult {
  created: number;
  alreadyExisted: number;
  enrolled: number;
  errors: { row: number; reason: string }[];
}

export const coursesApi = {
  list: () => http.get<Course[]>('/courses').then((r) => r.data),
  getOne: (id: string) => http.get<Course>(`/courses/${id}`).then((r) => r.data),
  create: (data: { name: string; instructorId: string }) =>
    http.post<Course>('/courses', data).then((r) => r.data),
  update: (id: string, data: { name?: string; instructorId?: string; status?: string }) =>
    http.patch<Course>(`/courses/${id}`, data).then((r) => r.data),

  listEnrollments: (courseId: string) =>
    http.get<Enrollment[]>(`/courses/${courseId}/enrollments`).then((r) => r.data),
  enrollOne: (courseId: string, data: { studentId: string; name: string }) =>
    http.post(`/courses/${courseId}/enrollments`, data).then((r) => r.data),
  enrollSelected: (courseId: string, studentIds: string[]) =>
    http.post(`/courses/${courseId}/enrollments/select`, { studentIds }).then((r) => r.data),
  enrollBulk: (courseId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http
      .post<BulkEnrollResult>(`/courses/${courseId}/enrollments/bulk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  removeEnrollment: (courseId: string, studentId: string) =>
    http.delete(`/courses/${courseId}/enrollments/${studentId}`),
};