import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cohortsApi } from './api';

const COHORTS_KEY = ['cohorts'] as const;
const membersKey = (cohortId: string) => ['cohorts', cohortId, 'members'];

export function useCohorts(enabled = true) {
  return useQuery({ queryKey: COHORTS_KEY, queryFn: cohortsApi.list, enabled });
}

export function useCohort(id: string) {
  return useQuery({ queryKey: [...COHORTS_KEY, id], queryFn: () => cohortsApi.getOne(id), enabled: !!id });
}

export function useCreateCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cohortsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COHORTS_KEY });
      toast.success('Cohort created.');
    },
  });
}

export function useUpdateCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; coordinatorId?: string; status?: string } }) =>
      cohortsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COHORTS_KEY });
      toast.success(variables.data.status === 'ARCHIVED' ? 'Cohort archived.' : 'Cohort updated.');
    },
  });
}

export function useMembers(cohortId: string) {
  return useQuery({
    queryKey: membersKey(cohortId),
    queryFn: () => cohortsApi.listMembers(cohortId),
    enabled: !!cohortId,
    retry: false,
  });
}

export function useAddOne(cohortId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentId: string; name: string }) => cohortsApi.addOne(cohortId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(cohortId) });
      toast.success('Student added to cohort.');
    },
  });
}

export function useAddSelected(cohortId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentIds: string[]) => cohortsApi.addSelected(cohortId, studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(cohortId) });
      toast.success('Students added.');
    },
  });
}

export function useAddBulk(cohortId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => cohortsApi.addBulk(cohortId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(cohortId) });
      toast.success('Bulk import complete.');
    },
  });
}

export function useRemoveMember(cohortId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => cohortsApi.removeMember(cohortId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(cohortId) });
      toast.success('Student removed from cohort.');
    },
  });
}