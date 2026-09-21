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
});