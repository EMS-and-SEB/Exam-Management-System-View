import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { staffApi } from './api';
import { useAuthStore } from '@/store/auth.store';

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
    queryFn: () => staffApi.list({ page: 1, limit: 20, search: search || undefined, role: role as 'INVIGILATOR' | undefined }),
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
      toast.success('Staff account created. An activation email was sent.');
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; email?: string; isActive?: boolean }; currentIsActive: boolean }) =>
      staffApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEY });
      const statusChanged = variables.data.isActive !== undefined && variables.data.isActive !== variables.currentIsActive;
      toast.success(
        statusChanged && variables.data.isActive === false
          ? 'Staff account deactivated.'
          : statusChanged && variables.data.isActive === true
            ? 'Staff account reactivated.'
            : 'Staff account updated.',
      );
    },
  });
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: staffApi.updateProfile,
    onSuccess: (staff) => {
      updateUser(staff);
      toast.success('Profile updated.');
    },
  });
}

export function useStaffDetails(id: string) {
  return useQuery({
    queryKey: [...STAFF_KEY, id],
    queryFn: () => staffApi.getOne(id),
    enabled: !!id,
  });
}

export function useUnassignStaffResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, resourceId, resourceType }: { staffId: string; resourceId: string; resourceType: 'course' | 'cohort' }) =>
      resourceType === 'course'
        ? staffApi.unassignCourse(staffId, resourceId)
        : staffApi.unassignCohort(staffId, resourceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...STAFF_KEY, variables.staffId] });
      queryClient.invalidateQueries({ queryKey: STAFF_KEY });
      toast.success(`${variables.resourceType === 'course' ? 'Course' : 'Cohort'} assignment removed.`);
    },
  });
}