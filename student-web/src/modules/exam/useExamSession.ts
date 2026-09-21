import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSessionStore } from "@/store/session.store";
import { useExamSessionStore } from "./store";
import { examApi } from "./api";
import type {
  AnswerValue,
  ExamQuestion,
  SessionSummary,
} from "./types";
import type { StudentExamQuestion } from "@/modules/auth/types";

const TEXT_DEBOUNCE_MS = 800;
const DISCRETE_TYPES = new Set<ExamQuestion["type"]>([
  "TRUE_FALSE",
  "MULTIPLE_CHOICE",
  "MULTIPLE_SELECT",
  "MATCHING",
]);

/** Bounded offline-retry policy (never infinite). */
const MAX_RETRIES = 5;
const RETRY_BASE_MS = 2000;
/** Low-frequency background probe for incident lockout resolution. */
const LOCKED_PROBE_MS = 10_000;

/** Normalize a loose server question into the typed union. */
function parseQuestion(raw: StudentExamQuestion): ExamQuestion {
  const type = raw.type;
  if (type === "MULTIPLE_CHOICE" || type === "MULTIPLE_SELECT") {
    return {
      ...raw,
      type,
      options: (Array.isArray(raw.options) ? raw.options : []) as {
        id: string;
        text: string;
      }[],
    } as ExamQuestion;
  }
  if (type === "MATCHING") {
    const o = (raw.options ?? {}) as { left?: unknown[]; right?: unknown[] };
    return {
      ...raw,
      type,
      options: {
        left: (o.left ?? []) as { id: string; text: string }[],
        right: (o.right ?? []) as { id: string; text: string }[],
      },
    } as ExamQuestion;
  }
  if (type === "FILL_BLANK") {
    const matches = raw.prompt.match(/\{\{\d+\}\}/g) ?? [];
    return { ...raw, type, blanks: matches.length } as ExamQuestion;
  }
  return { ...raw, type } as ExamQuestion;
}

export function isEmptyAnswer(value: AnswerValue | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "boolean") return false;
  if (typeof value === "string") return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Hook holding all exam-taking logic. Presentational components only consume it. */
export function useExamSession() {
  const session = useSessionStore((s) => s.session);
  const sessionId = session?.sessionToken ?? "";

  const questions = useMemo(
    () => (session?.examQuestions ?? []).map(parseQuestion),
    [session?.examQuestions],
  );

  const answers = useExamSessionStore((s) => s.answers);
  const saveStatus = useExamSessionStore((s) => s.saveStatus);
  const summary = useExamSessionStore((s) => s.summary);
  const currentIndex = useExamSessionStore((s) => s.currentIndex);
  const locked = useExamSessionStore((s) => s.locked);
  const offline = useExamSessionStore((s) => s.offline);
  const endsAt = useExamSessionStore((s) => s.endsAt);
  const markedForReview = useExamSessionStore((s) => s.markedForReview);

  const setAnswer = useExamSessionStore((s) => s.setAnswer);
  const setSaveStatus = useExamSessionStore((s) => s.setSaveStatus);
  const setCurrentIndex = useExamSessionStore((s) => s.setCurrentIndex);
  const setSummary = useExamSessionStore((s) => s.setSummary);
  const setLocked = useExamSessionStore((s) => s.setLocked);
  const setOffline = useExamSessionStore((s) => s.setOffline);
  const toggleMarkForReview = useExamSessionStore((s) => s.toggleMarkForReview);

  /** Debounced autosave timers per question id. */
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  /** Exponential-backoff retry timers per question id. */
  const retryTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  /** Most recent save attempt, kept so the lockout probe can retry exactly it. */
  const lastAttempted = useRef<{ questionId: string; value: AnswerValue } | null>(null);

  useEffect(() => {
    const t = timers.current;
    const r = retryTimers.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
      Object.values(r).forEach(clearTimeout);
    };
  }, []);

  const current = questions[currentIndex] ?? null;
  const currentStatus = current ? (saveStatus[current.id] ?? "idle") : "idle";

  const clearRetryTimer = (questionId: string) => {
    const t = retryTimers.current[questionId];
    if (t) {
      clearTimeout(t);
      delete retryTimers.current[questionId];
    }
  };

  const writeAnswerRef = useRef<
    (questionId: string, value: AnswerValue, attempt?: number) => void
  >(() => {});

  /**
   * Fire the autosave with resilience. Classifies failures:
   *  - 403 "unresolved incident"      -> LOCKED (inputs disabled; probe retries)
   *  - other 4xx (e.g. not accepting) -> error, no retry; the poll routes terminal
   *  - network / 5xx / 401            -> transient: bounded backoff retry
   *
   * This is the ONLY writer (also called by the lockout probe), so no lock guard
   * lives here; the user-facing `updateAnswer` guards instead.
   */
  const writeAnswer = useCallback(
    (questionId: string, value: AnswerValue, attempt = 0) => {
      if (!sessionId) return;
      const st = useExamSessionStore.getState();
      setSaveStatus(questionId, "saving");
      examApi
        .saveAnswer(sessionId, { examQuestionId: questionId, responseData: value })
        .then(() => {
          clearRetryTimer(questionId);
          setOffline(false);
          setSaveStatus(questionId, "saved");
          // A probe attempt succeeding means the incident was resolved.
          if (st.locked) setLocked(false);
        })
        .catch((err) => {
          const status = err?.response?.status as number | undefined;
          const msg: string = err?.message ?? "";

          if (status === 403 && msg.includes("unresolved incident")) {
            lastAttempted.current = { questionId, value };
            Object.values(retryTimers.current).forEach(clearTimeout);
            setLocked(true);
            setSaveStatus(questionId, "error");
            return;
          }

          if (status && status >= 400 && status < 500) {
            // Rejected for a stable reason (not accepting answers, etc.).
            // Retrying won't help; the running poll routes terminal states.
            clearRetryTimer(questionId);
            setSaveStatus(questionId, "error");
            return;
          }

          // Transient (network / 5xx / 401): retry with backoff, bounded.
          setOffline(true);
          if (attempt < MAX_RETRIES) {
            clearRetryTimer(questionId);
            retryTimers.current[questionId] = setTimeout(
              () => writeAnswerRef.current(questionId, value, attempt + 1),
              RETRY_BASE_MS * 2 ** attempt,
            );
          } else {
            setSaveStatus(questionId, "error");
          }
        });
    },
    [sessionId, setSaveStatus, setOffline, setLocked],
  );

  useEffect(() => {
    writeAnswerRef.current = writeAnswer;
  }, [writeAnswer]);

  const updateAnswer = useCallback(
    (questionId: string, value: AnswerValue) => {
      if (useExamSessionStore.getState().locked) return;

      const q = questions.find((x) => x.id === questionId);
      setAnswer(questionId, value);

      // Discrete actions fire immediately; typed input is debounced.
      const discrete = q && DISCRETE_TYPES.has(q.type);
      if (!discrete || value === null) {
        const existing = timers.current[questionId];
        if (existing) clearTimeout(existing);
        if (value === null) {
          writeAnswer(questionId, null);
          return;
        }
        timers.current[questionId] = setTimeout(
          () => writeAnswer(questionId, value),
          TEXT_DEBOUNCE_MS,
        );
        return;
      }
      writeAnswer(questionId, value);
    },
    [questions, setAnswer, writeAnswer],
  );

  /**
   * Incident-lockout probe. While locked we re-save the most recent attempt on a
   * low-frequency interval instead of hammering. Success -> unlocked. A terminal
   * status arriving via the poll is handled separately (it routes to post-submit);
   * here we just stop probing once we're unlocked or terminal.
   */
  useEffect(() => {
    if (!locked || !sessionId || summary) return;
    const id = setInterval(() => {
      const la = lastAttempted.current;
      if (la) void writeAnswer(la.questionId, la.value, 0);
    }, LOCKED_PROBE_MS);
    return () => clearInterval(id);
  }, [locked, sessionId, summary, writeAnswer]);

  const goNext = useCallback(
    () => setCurrentIndex(Math.min(currentIndex + 1, questions.length - 1)),
    [currentIndex, questions.length, setCurrentIndex],
  );
  const goPrev = useCallback(
    () => setCurrentIndex(Math.max(currentIndex - 1, 0)),
    [currentIndex, setCurrentIndex],
  );
  const goTo = useCallback(
    (index: number) => setCurrentIndex(Math.max(0, Math.min(index, questions.length - 1))),
    [questions.length, setCurrentIndex],
  );

  const unansweredCount = useMemo(
    () => questions.filter((q) => isEmptyAnswer(answers[q.id] ?? null)).length,
    [questions, answers],
  );

  const doSubmit = useCallback(async (): Promise<SessionSummary> => {
    const body = await examApi.submitExam(sessionId);
    setSummary(body);
    return body;
  }, [sessionId, setSummary]);

  return {
    sessionId,
    questions,
    current,
    currentIndex,
    currentStatus,
    saveStatus,
    answers,
    summary,
    locked,
    offline,
    endsAt,
    currentEndsAt: endsAt ?? session?.endsAt ?? "",
    markedForReview,
    updateAnswer,
    toggleMarkForReview,
    goNext,
    goPrev,
    goTo,
    unansweredCount,
    doSubmit,
    hasPrev: currentIndex > 0,
    hasNext: currentIndex < questions.length - 1,
    total: questions.length,
  };
}

export type { SaveStatus } from "./types";