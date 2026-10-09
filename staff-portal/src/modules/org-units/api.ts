import { http } from '@/lib/axios';

export interface OrgUnit {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: string;
}

export const orgUnitsApi = {
  listScoped: () => http.get<OrgUnit[]>('/org-units').then((r) => r.data),
};