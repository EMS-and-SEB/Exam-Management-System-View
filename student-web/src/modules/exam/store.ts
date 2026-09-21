import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AnswerValue, SessionSummary, SaveStatus } from "./types";
import { EXAM_STORAGE_KEY } from "@/store/keys";

interface ExamState {
  /** Client-side source of truth for answers, keyed by question id. */
  answers: Record<string, AnswerValue>;
  /** Per-question autosave status; purely reflects server sync, never gates render. */
  saveStatus: Record<string, SaveStatus>;
  /** Current question being viewed (index into the fixed question order). */
  currentIndex: number;
  /** Set once the exam reaches a terminal state (score present only if auto-graded). */
  summary: SessionSummary | null;
  /** Survive-refresh deadline, seeded from login and updated by each poll. */
  endsAt: string | null;
  /** Incident lockout: inputs disabled, only a probe re-attempts a save. */
  locked: boolean;
  /** Transient network trouble: retrying the last save with backoff. */
  offline: boolean;
  /** True once persisted state has been rehydrated from sessionStorage. */
  hasHydrated: boolean;
  /**
   * Client-side "mark for review" flags, keyed by question id. Local UI only,
   * intentionally NOT persisted (does not survive a refresh) and never sent to
   * the backend — there is no field for it server-side. It is a student study
   * aid, not exam data.
   */
  markedForReview: Record<string, boolean>;

  setAnswer: (questionId: string, value: AnswerValue) => void;
  setSaveStatus: (questionId: string, status: SaveStatus) => void;
  setCurrentIndex: (index: number) => void;
  setSummary: (summary: SessionSummary | null) => void;
  setEndsAt: (endsAt: string | null) => void;
  setLocked: (locked: boolean) => void;
  setOffline: (offline: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  toggleMarkForReview: (questionId: string) => void;
  reset: () => void;
}

const initial: Pick<
  ExamState,
  | "answers"
  | "saveStatus"
  | "currentIndex"
  | "summary"
  | "endsAt"
  | "locked"
  | "offline"
  | "hasHydrated"
  | "markedForReview"
> = {
  answers: {},
  saveStatus: {},
  currentIndex: 0,
  summary: null,
  endsAt: null,
  locked: false,
  offline: false,
  hasHydrated: false,
  markedForReview: {},
};

export const useExamSessionStore = create<ExamState>()(
  persist(
    (set) => ({
      ...initial,
      setAnswer: (questionId, value) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
      setSaveStatus: (questionId, status) =>
        set((s) => ({ saveStatus: { ...s.saveStatus, [questionId]: status } })),
      setCurrentIndex: (index) => set({ currentIndex: index }),
      setSummary: (summary) => set({ summary }),
      setEndsAt: (endsAt) => set({ endsAt }),
      setLocked: (locked) => set({ locked }),
      setOffline: (offline) => set({ offline }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      toggleMarkForReview: (questionId) =>
        set((s) => ({
          markedForReview: {
            ...s.markedForReview,
            [questionId]: !s.markedForReview[questionId],
          },
        })),
      reset: () => set({ ...initial, hasHydrated: true }),
    }),
    {
      name: EXAM_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        answers: s.answers,
        currentIndex: s.currentIndex,
        summary: s.summary,
        endsAt: s.endsAt,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);