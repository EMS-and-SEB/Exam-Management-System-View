import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { retentionPolicyApi } from "./api";

const RETENTION_KEY = ["retention-policy"] as const;

export function useRetentionPolicy() {
  return useQuery({ queryKey: RETENTION_KEY, queryFn: retentionPolicyApi.get });
}

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retentionPolicyApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RETENTION_KEY });
      toast.success("Retention policy updated.");
    },
  });
}

export function usePurgeExpiredData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retentionPolicyApi.purge,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RETENTION_KEY });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      if (data.purgedCount === 0) {
        toast.success("No exams were eligible for purge.");
      } else {
        toast.success(
          `Purged data for ${data.purgedCount} exam${data.purgedCount === 1 ? "" : "s"}.`,
        );
      }
    },
  });
}
