import { http } from "@/lib/axios";

export interface RetentionPolicy {
  resultRetentionDays: number;
  updatedAt: string;
}

export interface PurgeResult {
  purgedCount: number;
  purgedExams: string[];
}

export const retentionPolicyApi = {
  get: () => http.get<RetentionPolicy>("/retention-policy").then((r) => r.data),
  update: (data: { resultRetentionDays: number }) =>
    http.put<RetentionPolicy>("/retention-policy", data).then((r) => r.data),
  purge: () =>
    http.post<PurgeResult>("/retention-policy/purge").then((r) => r.data),
};
