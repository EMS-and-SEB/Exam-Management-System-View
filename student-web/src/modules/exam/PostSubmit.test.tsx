import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";
import { PostSubmit } from "./ExamLanding";

const summary = {
  status: "SUBMITTED" as const,
  submittedAt: "2026-10-20T10:00:00.000Z",
  score: 8,
  maxScore: 10,
};

beforeEach(() => {
  vi.useFakeTimers();
  useSessionStore.setState({ studentId: "UGR/1234/12" });
});

afterEach(() => {
  cleanup();
  useSessionStore.getState().clearSession();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PostSubmit", () => {
  it("shows the result for 30 seconds, then clears the session and returns to login", () => {
    render(
      <MemoryRouter initialEntries={["/exam"]}>
        <Routes>
          <Route path="/exam" element={<PostSubmit summary={summary} />} />
          <Route path="/login" element={<p data-testid="login-page">Login page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("8 / 10")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("30 seconds");
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(29_999));
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(useSessionStore.getState().studentId).toBeNull();
  });
});
