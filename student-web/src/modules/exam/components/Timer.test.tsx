import { describe, it, expect, vi, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { Timer } from "./Timer";

afterEach(() => vi.useRealTimers());

describe("Timer onExpired", () => {
  it("fires onExpired exactly once once the deadline has passed", () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    render(
      <Timer
        endsAt={new Date(Date.now() - 1000).toISOString()}
        onExpired={spy}
      />,
    );

    // The initial render already sees an elapsed deadline; subsequent ticks
    // must not re-fire (single-shot guard).
    act(() => vi.advanceTimersByTime(1000));
    expect(spy).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(30_000));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not fire before the deadline", () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    render(
      <Timer
        endsAt={new Date(Date.now() + 60_000).toISOString()}
        onExpired={spy}
      />,
    );
    act(() => vi.advanceTimersByTime(1000));
    expect(spy).not.toHaveBeenCalled();
  });
});