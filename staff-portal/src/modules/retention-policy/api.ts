import { http } from '@/lib/axios';

export interface RetentionPolicy {
  resultRetentionDays: number;
  updatedAt: string;
}

export const retentionPolicyApi = {
  get: () => http.get<RetentionPolicy>('/retention-policy').then((r) => r.data),
  update: (data: { resultRetentionDays: number }) =>
    http.put<RetentionPolicy>('/retention-policy', data).then((r) => r.data),
};