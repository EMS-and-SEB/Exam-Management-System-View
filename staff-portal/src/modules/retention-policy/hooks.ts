import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { retentionPolicyApi } from './api';

const RETENTION_KEY = ['retention-policy'] as const;

export function useRetentionPolicy() {
  return useQuery({ queryKey: RETENTION_KEY, queryFn: retentionPolicyApi.get });
}

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retentionPolicyApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RETENTION_KEY });
      toast.success('Retention policy updated.');
    },
  });
}