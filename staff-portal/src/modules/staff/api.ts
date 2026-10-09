import { http } from '@/lib/axios';
import type { StaffRole } from '@/types/role';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  orgUnitId: string;
  orgUnit?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  courses?: AssignedResource[];
  coordinatedCohorts?: AssignedResource[];
}

export interface AssignedResource {
  id: string;
  name: string;
  status: string;
}

interface StaffListResponse {
  staff: StaffMember[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  role: StaffRole;
  canCreateAdmins?: boolean;
  orgUnitId?: string;
  newOrgUnitName?: string;
}

export const staffApi = {
  list: (params: { page: number; limit: number; search?: string; role?: StaffRole | StaffRole[]; orgUnitId?: string; isActive?: boolean }) =>
    http.get<StaffListResponse>('/staff', { params }).then((r) => r.data),

  getOne: (id: string) => http.get<StaffMember>(`/staff/${id}`).then((r) => r.data),

  create: (data: CreateStaffPayload) =>
    http.post<StaffMember>('/staff', data).then((r) => r.data),

  update: (id: string, data: { name?: string; email?: string; isActive?: boolean }) =>
    http.patch<StaffMember>(`/staff/${id}`, data).then((r) => r.data),
  unassignCourse: (staffId: string, courseId: string) =>
    http.delete(`/staff/${staffId}/courses/${courseId}`).then((r) => r.data),
  unassignCohort: (staffId: string, cohortId: string) =>
    http.delete(`/staff/${staffId}/cohorts/${cohortId}`).then((r) => r.data),

  getProfile: () => http.get<StaffMember>('/staff/me').then((r) => r.data),
  updateProfile: (data: { name?: string; email?: string }) =>
    http.patch<StaffMember>('/staff/me', data).then((r) => r.data),
};