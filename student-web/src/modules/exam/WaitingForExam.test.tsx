import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WaitingForExam } from "./ExamLanding";

const start = "2026-06-01T00:00:10.000Z";
const serverNow = "2026-06-01T00:00:00.000Z";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(serverNow));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("WaitingForExam countdown", () => {
  it("decreases monotonically for an unchanged scheduled start", () => {
    render(<WaitingForExam title="Exam" scheduledStart={start} serverNow={serverNow} />);
    const countdown = screen.getByTestId("exam-countdown");
    const values = [countdown.textContent];

    for (let i = 0; i < 5; i += 1) {
      act(() => vi.advanceTimersByTime(1000));
      values.push(countdown.textContent);
    }

    expect(values).toEqual([
      "00:00:10", "00:00:09", "00:00:08", "00:00:07", "00:00:06", "00:00:05",
    ]);
  });

  it("does not increase when a delayed poll supplies an older server timestamp", () => {
    const view = render(<WaitingForExam title="Exam" scheduledStart={start} serverNow={serverNow} />);
    const countdown = screen.getByTestId("exam-countdown");
    act(() => vi.advanceTimersByTime(2000));
    expect(countdown.textContent).toBe("00:00:08");

    view.rerender(
      <WaitingForExam
        title="Exam"
        scheduledStart={start}
        serverNow="2026-05-31T23:59:59.000Z"
      />,
    );
    expect(countdown.textContent).toBe("00:00:08");
  });

  it("keeps the waiting message stable and uses one timer across rerenders", () => {
    const intervalSpy = vi.spyOn(window, "setInterval");
    const message = "This page will open the exam automatically.";
    const view = render(<WaitingForExam title="Exam" scheduledStart={start} serverNow={serverNow} />);

    expect(screen.getByText(message)).toBeTruthy();
    view.rerender(
      <WaitingForExam
        title="Exam"
        scheduledStart={start}
        serverNow="2026-06-01T00:00:01.000Z"
      />,
    );
    act(() => vi.advanceTimersByTime(1000));

    expect(intervalSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.getByTestId("exam-countdown").textContent).toBe("00:00:08");
  });

  it("stops at zero and cleans up its timer when the component unmounts", () => {
    const clearSpy = vi.spyOn(window, "clearInterval");
    const view = render(<WaitingForExam title="Exam" scheduledStart={start} serverNow={serverNow} />);

    act(() => vi.advanceTimersByTime(12_000));
    expect(screen.getByTestId("exam-countdown").textContent).toBe("00:00:00");
    const clearCallsAtZero = clearSpy.mock.calls.length;
    act(() => vi.advanceTimersByTime(2000));
    expect(clearSpy).toHaveBeenCalledTimes(clearCallsAtZero);

    view.unmount();
    expect(clearSpy).toHaveBeenCalledTimes(clearCallsAtZero + 1);
  });

  it("restarts the timer deliberately when the authoritative scheduled start changes", () => {
    const view = render(<WaitingForExam title="Exam" scheduledStart={start} serverNow={serverNow} />);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTestId("exam-countdown").textContent).toBe("00:00:07");

    view.rerender(
      <WaitingForExam
        title="Exam"
        scheduledStart="2026-06-01T00:00:20.000Z"
        serverNow="2026-06-01T00:00:03.000Z"
      />,
    );
    expect(screen.getByTestId("exam-countdown").textContent).toBe("00:00:17");
  });
});
