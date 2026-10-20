import { useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { useExamSessionStore } from "./store";
import { examApi, isPollLive, isPollWaiting } from "./api";

export const POLL_INTERVAL_MS = 7000;
export const WAITING_POLL_INTERVAL_MS = 1000;

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
  const setSession = useSessionStore((s) => s.setSession);
  const setSummary = useExamSessionStore((s) => s.setSummary);
  const setEndsAt = useExamSessionStore((s) => s.setEndsAt);
  const reconcileAnswers = useExamSessionStore((s) => s.reconcileAnswers);
  const waitingClockSyncedFor = useRef("");

  const query = useQuery({
    queryKey: pollQueryKey(sessionId),
    queryFn: () => examApi.getSession(sessionId),
    enabled: enabled && Boolean(sessionId) && Boolean(session),
    refetchInterval: (q) => {
      const data = q.state.data;
      if (data && !isPollLive(data) && !isPollWaiting(data)) return false;
      return data && isPollWaiting(data) ? WAITING_POLL_INTERVAL_MS : POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const data = query.data;
    if (!data) return;
    if (isPollWaiting(data)) {
      const scheduleChanged = session?.scheduledStart !== data.scheduledStart;
      const needsInitialClockSync = waitingClockSyncedFor.current !== sessionId;
      if (session && (
        session.status !== "NOT_STARTED" ||
        scheduleChanged ||
        needsInitialClockSync ||
        session.examQuestions.length !== 0
      )) {
        setSession({
          ...session,
          status: "NOT_STARTED",
          scheduledStart: data.scheduledStart,
          serverNow: needsInitialClockSync || scheduleChanged ? data.serverNow : session.serverNow,
          endsAt: null,
          examQuestions: [],
        });
        waitingClockSyncedFor.current = sessionId;
      }
    } else if (isPollLive(data)) {
      if (session && (
        session.status !== "IN_PROGRESS" ||
        session.serverNow !== data.serverNow ||
        session.endsAt !== data.endsAt ||
        session.examQuestions !== data.questions
      )) setSession({ ...session, status: "IN_PROGRESS", serverNow: data.serverNow, endsAt: data.endsAt, examQuestions: data.questions as never });
      setEndsAt(data.endsAt);
      reconcileAnswers(
        data.answers ?? [],
        data.questions.map((question) => question.id),
      );
    } else {
      setSummary(data);
    }
  }, [query.data, session, sessionId, setSession, setEndsAt, setSummary, reconcileAnswers]);

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
