import { http } from '@/lib/axios';

export interface Cohort {
  id: string;
  name: string;
  coordinatorId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  coordinator?: { name: string; email: string };
}

interface CohortMember {
  id: string;
  studentId: string;
  createdAt: string;
  student: { studentId: string; name: string };
}

interface BulkAddResult {
  created: number;
  alreadyExisted: number;
  added: number;
  errors: { row: number; reason: string }[];
}

export const cohortsApi = {
  list: () => http.get<Cohort[]>('/cohorts').then((r) => r.data),
  getOne: (id: string) => http.get<Cohort>(`/cohorts/${id}`).then((r) => r.data),
  create: (data: { name: string; coordinatorId: string }) =>
    http.post<Cohort>('/cohorts', data).then((r) => r.data),
  update: (id: string, data: { name?: string; coordinatorId?: string; status?: string }) =>
    http.patch<Cohort>(`/cohorts/${id}`, data).then((r) => r.data),

  listMembers: (cohortId: string) =>
    http.get<CohortMember[]>(`/cohorts/${cohortId}/members`).then((r) => r.data),
  addOne: (cohortId: string, data: { studentId: string; name: string }) =>
    http.post(`/cohorts/${cohortId}/members`, data).then((r) => r.data),
  addSelected: (cohortId: string, studentIds: string[]) =>
    http.post(`/cohorts/${cohortId}/members/select`, { studentIds }).then((r) => r.data),
  addBulk: (cohortId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http
      .post<BulkAddResult>(`/cohorts/${cohortId}/members/bulk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  removeMember: (cohortId: string, studentId: string) =>
    http.delete(`/cohorts/${cohortId}/members/${studentId}`),
};