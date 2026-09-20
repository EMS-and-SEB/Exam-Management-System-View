import { describe, expect, it, beforeEach } from "vitest";
import { useSessionStore } from "./session.store";
import type { StudentLoginResponse } from "@/modules/auth/types";

const session: StudentLoginResponse = {
  sessionToken: "session-123",
  exam: { id: "exam-1", title: "Midterm", examType: "MIDTERM" },
  endsAt: "2026-09-19T10:00:00.000Z",
  examQuestions: [],
};

describe("session store", () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession();
  });

  it("starts with no session", () => {
    expect(useSessionStore.getState().session).toBeNull();
  });

  it("stores the full login response on setSession", () => {
    useSessionStore.getState().setSession(session);
    expect(useSessionStore.getState().session).toEqual(session);
  });

  it("clears the session on clearSession", () => {
    useSessionStore.getState().setSession(session);
    useSessionStore.getState().clearSession();
    expect(useSessionStore.getState().session).toBeNull();
  });

  it("captures the typed student id and clears it with the session", () => {
    useSessionStore.getState().setStudentId("CTC-0001");
    expect(useSessionStore.getState().studentId).toBe("CTC-0001");

    useSessionStore.getState().setSession(session);
    useSessionStore.getState().clearSession();
    expect(useSessionStore.getState().session).toBeNull();
    expect(useSessionStore.getState().studentId).toBeNull();
  });
});