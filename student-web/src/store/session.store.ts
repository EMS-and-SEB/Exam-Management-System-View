import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useExamSessionStore } from "@/modules/exam/store";
import type { StudentLoginResponse } from "@/modules/auth/types";
import { SESSION_STORAGE_KEY, EXAM_STORAGE_KEY } from "./keys";

export { SESSION_STORAGE_KEY, EXAM_STORAGE_KEY };

interface SessionState {
  session: StudentLoginResponse | null;
  /**
   * The student ID as typed into the login form. The login response contains
   * no studentId/profile field, so the only source is the form input; it is
   * captured here and displayed in the exam header. Decorative only.
   */
  studentId: string | null;
  /** True once persisted state has been rehydrated from sessionStorage. */
  hasHydrated: boolean;
  setSession: (session: StudentLoginResponse) => void;
  setStudentId: (studentId: string) => void;
  clearSession: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

/**
 * The whole login response (token + exam + endsAt + examQuestions) is
 * persisted to sessionStorage so a refresh mid-exam rebuilds the page.
 * sessionStorage is the single client-side copy of answers (the backend has
 * its own per autosave, but no endpoint returns them to rehydrate — flagged
 * as a backend gap in the PR description).
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      studentId: null,
      hasHydrated: false,
      setSession: (session) => set({ session }),
      setStudentId: (studentId) => set({ studentId }),
      clearSession: () => {
        sessionStorage.removeItem(EXAM_STORAGE_KEY);
        useExamSessionStore.getState().reset();
        set({ session: null, studentId: null });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ session: s.session, studentId: s.studentId }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);