import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSessionStore } from "@/store/session.store";
import { useExamSessionStore } from "./store";
import { useExamPolling } from "./useExamPolling";
import { examApi } from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    examApi: {
      ...actual.examApi,
      getSession: vi.fn(),
    },
  };
});

const mockedGet = vi.mocked(examApi.getSession);

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

beforeEach(() => {
  useSessionStore.setState({
    session: { sessionToken: "sess-p" } as never,
    hasHydrated: true,
  });
  useExamSessionStore.setState({
    ...useExamSessionStore.getState(),
    summary: null,
    endsAt: null,
  });
  mockedGet.mockReset();
});

describe("useExamPolling", () => {
  it("publishes the live endsAt into the store from an IN_PROGRESS body", async () => {
    mockedGet.mockResolvedValue({
      status: "IN_PROGRESS",
      endsAt: "2026-06-01T00:00:00.000Z",
      questions: [],
      answers: [],
    });
    const client = makeClient();
    renderHook(() => useExamPolling({ enabled: true }), {
      wrapper: wrapper(client),
    });

    await waitFor(() =>
      expect(useExamSessionStore.getState().endsAt).toBe("2026-06-01T00:00:00.000Z"),
    );
    expect(useExamSessionStore.getState().summary).toBeNull();
    client.clear();
  });

  it("reconciles answers from the current session poll by exam question ID", async () => {
    useExamSessionStore.getState().setAnswer("question-saved", "stale");
    useExamSessionStore.getState().setAnswer("question-blank", "stale value");
    mockedGet.mockResolvedValue({
      status: "IN_PROGRESS",
      endsAt: "2026-06-01T00:00:00.000Z",
      questions: [
        { id: "question-saved" },
        { id: "question-blank" },
      ] as never,
      answers: [{ examQuestionId: "question-saved", responseData: "saved" }],
    });
    const client = makeClient();
    renderHook(() => useExamPolling({ enabled: true }), { wrapper: wrapper(client) });

    await waitFor(() =>
      expect(useExamSessionStore.getState().answers).toEqual({ "question-saved": "saved" }),
    );
    client.clear();
  });

  it("routes a terminal body into summary", async () => {
    mockedGet.mockResolvedValue({
      status: "FORCE_SUBMITTED",
      submittedAt: "2026-06-01T00:00:00.000Z",
      score: 0,
      maxScore: 3,
    });
    const client = makeClient();
    renderHook(() => useExamPolling({ enabled: true }), {
      wrapper: wrapper(client),
    });

    await waitFor(() =>
      expect(useExamSessionStore.getState().summary?.status).toBe("FORCE_SUBMITTED"),
    );
    client.clear();
  });

  it("keeps an early authenticated session on the question-free waiting state", async () => {
    mockedGet.mockResolvedValue({
      status: "NOT_STARTED",
      scheduledStart: "2026-06-01T00:01:00.000Z",
      serverNow: "2026-06-01T00:00:00.000Z",
    });
    const client = makeClient();
    renderHook(() => useExamPolling({ enabled: true }), { wrapper: wrapper(client) });

    await waitFor(() =>
      expect(useSessionStore.getState().session).toMatchObject({
        status: "NOT_STARTED",
        scheduledStart: "2026-06-01T00:01:00.000Z",
        examQuestions: [],
      }),
    );
    expect(useExamSessionStore.getState().summary).toBeNull();
    client.clear();
  });

  it("switches the persisted waiting session to the active exam from the server poll", async () => {
    mockedGet.mockResolvedValue({
      status: "IN_PROGRESS",
      scheduledStart: null,
      serverNow: "2026-06-01T00:01:00.000Z",
      endsAt: "2026-06-01T01:01:00.000Z",
      questions: [{ id: "question-1" }] as never,
      answers: [],
    });
    const client = makeClient();
    renderHook(() => useExamPolling({ enabled: true }), { wrapper: wrapper(client) });

    await waitFor(() =>
      expect(useSessionStore.getState().session).toMatchObject({
        status: "IN_PROGRESS",
        endsAt: "2026-06-01T01:01:00.000Z",
        examQuestions: [{ id: "question-1" }],
      }),
    );
    expect(useExamSessionStore.getState().endsAt).toBe("2026-06-01T01:01:00.000Z");
    client.clear();
  });
});
