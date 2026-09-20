import { http } from '@/lib/axios';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  createdAt: string;
}

interface StudentListResponse {
  students: Student[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface BulkImportResult {
  created: number;
  updated: number;
  errors: { row: number; reason: string }[];
}

export const studentsApi = {
  list: (params: { page: number; limit: number; search?: string }) =>
    http.get<StudentListResponse>('/students', { params }).then((r) => r.data),

  getOne: (id: string) => http.get<Student>(`/students/${id}`).then((r) => r.data),

  create: (data: { studentId: string; name: string }) =>
    http.post<Student>('/students', data).then((r) => r.data),

  update: (id: string, data: { studentId?: string; name?: string }) =>
    http.patch<Student>(`/students/${id}`, data).then((r) => r.data),

  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http
      .post<BulkImportResult>('/students/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};