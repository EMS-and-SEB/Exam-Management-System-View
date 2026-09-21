import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useSessionStore,
  SESSION_STORAGE_KEY,
  EXAM_STORAGE_KEY,
} from "@/store/session.store";
import { useExamSessionStore } from "./store";
import type { StudentLoginResponse } from "@/modules/auth/types";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    examApi: {
      getSession: vi.fn().mockResolvedValue(null),
      submitExam: vi.fn().mockResolvedValue({ status: "SUBMITTED", submittedAt: "2026-01-01" }),
      saveAnswer: vi.fn().mockResolvedValue({ saved: true }),
    },
  };
});

import { useExamSession, isEmptyAnswer } from "./useExamSession";
import { examApi } from "./api";
const mockedSave = vi.mocked(examApi.saveAnswer);

const session: StudentLoginResponse = {
  sessionToken: "sess-1",
  exam: { id: "e1", title: "Demo", examType: "MIDTERM" },
  endsAt: "2099-01-01T00:00:00.000Z",
  examQuestions: [
    {
      id: "q-mc",
      examId: "e1",
      sourceQuestionId: null,
      type: "MULTIPLE_CHOICE",
      prompt: "Pick one",
      options: [
        { id: "opt-a", text: "A" },
        { id: "opt-b", text: "B" },
      ],
      points: 1,
      order: 1,
    },
    {
      id: "q-workout",
      examId: "e1",
      sourceQuestionId: null,
      type: "WORKOUT",
      prompt: "Solve",
      options: null,
      points: 5,
      order: 2,
    },
  ],
};

beforeEach(() => {
  sessionStorage.clear();
  useSessionStore.setState({
    session,
    hasHydrated: false,
  });
  useExamSessionStore.setState({
    ...useExamSessionStore.getState(),
    hasHydrated: false,
  });
  useExamSessionStore.getState().reset();
  mockedSave.mockClear();
  mockedSave.mockResolvedValue({ saved: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Flush pending promise microtasks inside an act() so `.catch`/`.then` settle. */
async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

function lockoutError() {
  return Object.assign(
    new Error("Session is locked out due to an unresolved incident."),
    { response: { status: 403 } },
  );
}

function networkError() {
  return new Error("Network Error");
}

describe("useExamSession autosave trigger", () => {
  it("fires saveAnswer immediately for discrete types (MULTIPLE_CHOICE)", async () => {
    const { result } = renderHook(() => useExamSession());
    act(() => {
      result.current.updateAnswer("q-mc", "opt-a");
    });
    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));
    expect(mockedSave).toHaveBeenCalledWith("sess-1", {
      examQuestionId: "q-mc",
      responseData: "opt-a",
    });
  });

  it("debounces saveAnswer for typed input (WORKOUT) until the debounce window elapses", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useExamSession());
    act(() => {
      result.current.updateAnswer("q-workout", "4");
      result.current.updateAnswer("q-workout", "42");
    });
    expect(mockedSave).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(mockedSave).toHaveBeenCalledTimes(1);
    expect(mockedSave).toHaveBeenCalledWith("sess-1", {
      examQuestionId: "q-workout",
      responseData: "42",
    });
  });
});

describe("unanswered accounting", () => {
  it("counts questions with no answer as unanswered", () => {
    const { result } = renderHook(() => useExamSession());
    expect(result.current.unansweredCount).toBe(2);

    act(() => result.current.updateAnswer("q-mc", "opt-a"));
    expect(result.current.unansweredCount).toBe(1);
  });

  it("isEmptyAnswer treats false, '' , and [] consistently", () => {
    expect(isEmptyAnswer(false)).toBe(false); // an explicit choice
    expect(isEmptyAnswer("")).toBe(true);
    expect(isEmptyAnswer([])).toBe(true);
    expect(isEmptyAnswer(null)).toBe(true);
    expect(isEmptyAnswer(undefined)).toBe(true);
  });
});

describe("mark for review (client-side only)", () => {
  it("toggles a per-question local flag and never touches the network", () => {
    const { result } = renderHook(() => useExamSession());
    expect(result.current.markedForReview["q-mc"]).toBeUndefined();

    act(() => result.current.toggleMarkForReview("q-mc"));
    expect(result.current.markedForReview["q-mc"]).toBe(true);

    act(() => result.current.toggleMarkForReview("q-mc"));
    expect(result.current.markedForReview["q-mc"]).toBe(false);

    // It's local UI state only — no autosave call is made for it.
    expect(mockedSave).not.toHaveBeenCalled();
  });
});

describe("submit flow", () => {
  it("submits and stores the terminal summary", async () => {
    const { result } = renderHook(() => useExamSession());
    act(() => {
      void result.current.doSubmit();
    });
    await waitFor(() => expect(result.current.summary?.status).toBe("SUBMITTED"));
    expect(examApi.submitExam).toHaveBeenCalledWith("sess-1");
  });
});

describe("incident lockout state machine", () => {
  it("locks on the first lockout 403 and blocks further edits", async () => {
    vi.useFakeTimers();
    mockedSave.mockRejectedValueOnce(lockoutError());
    const { result } = renderHook(() => useExamSession());

    act(() => result.current.updateAnswer("q-mc", "opt-a"));
    await flush();

    expect(result.current.locked).toBe(true);
    expect(result.current.saveStatus["q-mc"]).toBe("error");

    // updateAnswer is a no-op while locked (no write, no answer change).
    act(() => result.current.updateAnswer("q-mc", "opt-b"));
    expect(mockedSave).toHaveBeenCalledTimes(1);
    expect(result.current.answers["q-mc"]).toBe("opt-a");
  });

  it("re-saves the last attempt via the probe and unlocks once it succeeds", async () => {
    vi.useFakeTimers();
    mockedSave.mockRejectedValueOnce(lockoutError());
    const { result } = renderHook(() => useExamSession());

    act(() => result.current.updateAnswer("q-mc", "opt-a"));
    await flush();
    expect(result.current.locked).toBe(true);
    expect(mockedSave).toHaveBeenCalledTimes(1);

    // Probe interval (10s) fires: re-saves { q-mc, 'opt-a' } -> success -> unlock.
    act(() => vi.advanceTimersByTime(10_000));
    await flush();

    expect(mockedSave).toHaveBeenCalledTimes(2);
    expect(mockedSave).toHaveBeenLastCalledWith("sess-1", {
      examQuestionId: "q-mc",
      responseData: "opt-a",
    });
    expect(result.current.locked).toBe(false);
    expect(result.current.saveStatus["q-mc"]).toBe("saved");
  });

  it("stays locked while probe re-checks keep failing with a lockout 403", async () => {
    vi.useFakeTimers();
    mockedSave.mockRejectedValueOnce(lockoutError());
    mockedSave.mockRejectedValueOnce(lockoutError());
    const { result } = renderHook(() => useExamSession());

    act(() => result.current.updateAnswer("q-mc", "opt-a"));
    await flush();
    expect(result.current.locked).toBe(true);

    act(() => vi.advanceTimersByTime(10_000));
    await flush();
    expect(result.current.locked).toBe(true);
    expect(mockedSave).toHaveBeenCalledTimes(2);
  });

  it("treats a stable 4xx (not accepting answers) as a terminal hint, no retry", async () => {
    vi.useFakeTimers();
    mockedSave.mockRejectedValueOnce(
      Object.assign(new Error("Session is not accepting answers."), {
        response: { status: 403 },
      }),
    );
    const { result } = renderHook(() => useExamSession());

    act(() => result.current.updateAnswer("q-mc", "opt-a"));
    await flush();

    expect(result.current.saveStatus["q-mc"]).toBe("error");
    act(() => vi.advanceTimersByTime(200_000));
    expect(mockedSave).toHaveBeenCalledTimes(1);
  });
});

describe("network resilience (bounded backoff)", () => {
  it("retries a transient failure once after the first backoff tick, then recovers", async () => {
    vi.useFakeTimers();
    mockedSave.mockRejectedValueOnce(networkError());
    const { result } = renderHook(() => useExamSession());

    act(() => result.current.updateAnswer("q-mc", "opt-a"));
    expect(mockedSave).toHaveBeenCalledTimes(1);
    await flush(); // let the network error settle and schedule the retry timer

    act(() => vi.advanceTimersByTime(2_000));
    await flush();

    expect(mockedSave).toHaveBeenCalledTimes(2);
    expect(result.current.offline).toBe(false);
    expect(result.current.saveStatus["q-mc"]).toBe("saved");
  });

  it("never retries more than MAX_RETRIES and settles to error, never infinite", async () => {
    vi.useFakeTimers();
    mockedSave.mockRejectedValue(networkError());
    const { result } = renderHook(() => useExamSession());

    act(() => result.current.updateAnswer("q-mc", "opt-a"));
    await flush();

    // Backoff steps are 2s, 4s, 8s, 16s, 32s (5 retries after the first attempt).
    const steps = [2_000, 4_000, 8_000, 16_000, 32_000];
    for (const step of steps) {
      act(() => vi.advanceTimersByTime(step));
      await flush();
    }

    // Initial + 5 retries = 6 total calls.
    expect(mockedSave).toHaveBeenCalledTimes(6);
    expect(result.current.saveStatus["q-mc"]).toBe("error");

    // A huge advance must NOT add a 7th call (bounded, not infinite).
    act(() => vi.advanceTimersByTime(1_000_000));
    expect(mockedSave).toHaveBeenCalledTimes(6);
  });
});

describe("session storage persistence", () => {
  it("persists the login session and answers to sessionStorage", () => {
    useSessionStore.setState({ session, hasHydrated: true });
    useExamSessionStore.getState().setAnswer("q-workout", "42");

    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toContain("sess-1");
    expect(sessionStorage.getItem(EXAM_STORAGE_KEY)).toContain("q-workout");
  });

  it("rehydration marks both stores as hydrated", () => {
    useSessionStore.setState({ hasHydrated: true });
    useExamSessionStore.setState({ hasHydrated: true });
    expect(useSessionStore.getState().hasHydrated).toBe(true);
    expect(useExamSessionStore.getState().hasHydrated).toBe(true);
  });
});