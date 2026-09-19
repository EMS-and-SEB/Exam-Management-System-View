import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { staffApi } from './api';

const STAFF_KEY = ['staff'] as const;

export function useStaff(params: { page: number; limit: number; search?: string }) {
  return useQuery({
    queryKey: [...STAFF_KEY, params],
    queryFn: () => staffApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useStaffSearch(search: string, role?: string) {
  return useQuery({
    queryKey: ['staff-search', search, role],
    queryFn: () => staffApi.list({ page: 1, limit: 20, search: search || undefined }),
    enabled: search.length > 0,
    select: (data) => (role ? data.staff.filter((s) => s.role === role) : data.staff),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEY });
      toast.success('Staff account created.');
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; email?: string; isActive?: boolean } }) =>
      staffApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEY });
      toast.success(
        variables.data.isActive === false
          ? 'Staff account deactivated.'
          : variables.data.isActive === true
            ? 'Staff account reactivated.'
            : 'Staff account updated.',
      );
    },
  });
}