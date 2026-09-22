import { http } from '@/lib/axios';

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { name: string } | null;
}

interface AuditLogResponse {
  entries: AuditLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface RecentAuditLogResponse {
  entries: AuditLogEntry[];
}

export const auditApi = {
  listForUser: (userId: string, params: { page: number; limit: number }) =>
    http.get<AuditLogResponse>(`/users/${userId}/audit-logs`, { params }).then((r) => r.data),
  listRecent: (limit: number) =>
    http.get<RecentAuditLogResponse>('/audit-logs/recent', { params: { limit } }).then((r) => r.data),
};