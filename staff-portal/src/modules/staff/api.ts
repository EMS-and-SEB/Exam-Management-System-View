import { http } from '@/lib/axios';
import type { StaffRole } from '@/types/role';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

interface StaffListResponse {
  staff: StaffMember[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const staffApi = {
  list: (params: { page: number; limit: number; search?: string }) =>
    http.get<StaffListResponse>('/staff', { params }).then((r) => r.data),

  getOne: (id: string) => http.get<StaffMember>(`/staff/${id}`).then((r) => r.data),

  create: (data: { name: string; email: string; role: StaffRole }) =>
    http.post<StaffMember>('/staff', data).then((r) => r.data),

  update: (id: string, data: { name?: string; email?: string; isActive?: boolean }) =>
    http.patch<StaffMember>(`/staff/${id}`, data).then((r) => r.data),
};