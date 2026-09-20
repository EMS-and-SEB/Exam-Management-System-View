import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { useExamSessionStore } from "./store";
import { examApi, isPollLive } from "./api";

export const POLL_INTERVAL_MS = 7000;

export function pollQueryKey(sessionId: string) {
  return ["session-poll", sessionId] as const;
}

/**
 * Core polling loop. The backend only finalizes a session lazily — inside the
 * poll handler when a poll arrives after `endsAt` (no background job). So this
 * loop is not a UI convenience: it is what moves IN_PROGRESS -> SUBMITTED /
 * EXPIRED. It keeps running in the background (refetchIntervalInBackground)
 * so a student who alt-tabs near the end doesn't prevent their own submission
 * from finalizing.
 *
 * On every IN_PROGRESS body we refresh `endsAt` (it can be extended
 * server-side). The instant a terminal body arrives we stop and push it into
 * the exam store as `summary`; the UI routes to the post-submit screen.
 */
export function useExamPolling({ enabled }: { enabled: boolean }) {
  const sessionId = useSessionStore((s) => s.session?.sessionToken ?? "");
  const session = useSessionStore((s) => s.session);
  const setSummary = useExamSessionStore((s) => s.setSummary);
  const setEndsAt = useExamSessionStore((s) => s.setEndsAt);

  const query = useQuery({
    queryKey: pollQueryKey(sessionId),
    queryFn: () => examApi.getSession(sessionId),
    enabled: enabled && Boolean(sessionId) && Boolean(session),
    refetchInterval: (q) =>
      q.state.data && !isPollLive(q.state.data) ? false : POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const data = query.data;
    if (!data) return;
    if (isPollLive(data)) {
      setEndsAt(data.endsAt);
    } else {
      setSummary(data);
    }
  }, [query.data, setEndsAt, setSummary]);

  return {
    ...query,
    sessionId,
  };
}

/** Imperative immediate refetch, used by the cosmetic timer at zero. */
export function useInvalidatePoll() {
  const queryClient = useQueryClient();
  const sessionId = useSessionStore((s) => s.session?.sessionToken ?? "");
  return useCallback(() => {
    if (sessionId) {
      void queryClient.invalidateQueries({ queryKey: pollQueryKey(sessionId) });
    }
  }, [queryClient, sessionId]);
}