import { useQuery } from '@tanstack/react-query';
import { auditApi } from './api';

export function useAuditLog(userId: string, params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['audit', userId, params],
    queryFn: () => auditApi.listForUser(userId, params),
    enabled: !!userId,
  });
}

export function useRecentAuditLog(limit: number, enabled = true) {
  return useQuery({
    queryKey: ['audit', 'recent', limit],
    queryFn: () => auditApi.listRecent(limit),
    enabled,
  });
}