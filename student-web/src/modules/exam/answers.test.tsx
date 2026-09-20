import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionRenderer } from "./components/QuestionRenderer";
import type { AnswerValue, ExamQuestion } from "./types";

const base = { examId: "e1", sourceQuestionId: null, points: 1, order: 1 };

/** Controlled harness: feeds the emitted value back so controlled inputs work. */
function Harness({
  question,
  onChange,
}: {
  question: ExamQuestion;
  onChange: (v: AnswerValue) => void;
}) {
  const [v, setV] = useState<AnswerValue>(null);
  return (
    <QuestionRenderer
      question={question}
      value={v}
      onChange={(nv) => {
        setV(nv);
        onChange(nv);
      }}
    />
  );
}

/**
 * Each case asserts the exact `responseData` shape the renderer emits via
 * onChange, matching the backend's isCorrectAnswer() comparison. See types.ts.
 */
describe("answer components emit the required responseData shape", () => {
  it("TRUE_FALSE emits a boolean", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        question={{ ...base, id: "q1", type: "TRUE_FALSE", prompt: "p" }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "False" }));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("MULTIPLE_CHOICE emits the option id (string), not its text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        question={{
          ...base,
          id: "q1",
          type: "MULTIPLE_CHOICE",
          prompt: "p",
          options: [
            { id: "opt-a", text: "Postgres" },
            { id: "opt-b", text: "React" },
          ],
        }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Postgres/ }));
    expect(onChange).toHaveBeenLastCalledWith("opt-a");
  });

  it("MULTIPLE_SELECT emits an array of option ids", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        question={{
          ...base,
          id: "q1",
          type: "MULTIPLE_SELECT",
          prompt: "p",
          options: [
            { id: "opt-a", text: "A" },
            { id: "opt-b", text: "B" },
          ],
        }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /A/ }));
    await user.click(screen.getByRole("button", { name: /B/ }));
    expect(onChange).toHaveBeenLastCalledWith(["opt-a", "opt-b"]);
    await user.click(screen.getByRole("button", { name: /B/ }));
    expect(onChange).toHaveBeenLastCalledWith(["opt-a"]);
  });

  it("MATCHING emits an array of { leftId, rightId } pairs", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        question={{
          ...base,
          id: "q1",
          type: "MATCHING",
          prompt: "p",
          options: {
            left: [
              { id: "l1", text: "Who" },
              { id: "l2", text: "What" },
            ],
            right: [
              { id: "r1", text: "Alice" },
              { id: "r2", text: "Cat" },
            ],
          },
        }}
        onChange={onChange}
      />,
    );
    await user.selectOptions(screen.getByTestId("matching-select-0"), "r1");
    expect(onChange).toHaveBeenLastCalledWith([{ leftId: "l1", rightId: "r1" }]);
  });

  it("FILL_BLANK emits a string[] with one entry per blank, in order", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        question={{
          ...base,
          id: "q1",
          type: "FILL_BLANK",
          prompt: "Sky is {{0}} and grass is {{1}}.",
          blanks: 2,
        }}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByTestId("fill-blank-0"), "blue");
    await user.type(screen.getByTestId("fill-blank-1"), "green");
    expect(onChange).toHaveBeenLastCalledWith(["blue", "green"]);
  });

  it("WORKOUT emits a free-text string", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        question={{ ...base, id: "q1", type: "WORKOUT", prompt: "Solve" }}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByTestId("workout-answer"), "42");
    expect(onChange).toHaveBeenLastCalledWith("42");
  });

  /**
   * Regression for the ExamLanding wiring: QuestionRenderer emits
   * onChange(value, questionId), but the statement's updateAnswer is
   * (questionId, value). Verify the two-arg contract so an order swap (which
   * POSTed a non-UUID examQuestionId -> 400) cannot silently reappear.
   */
  it("QuestionRenderer emits onChange as (value, questionId)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<[unknown, string]>();

    render(
      <QuestionRenderer
        question={{
          ...base,
          id: "uuid-q",
          type: "MULTIPLE_CHOICE",
          prompt: "pick",
          options: [{ id: "opt-a", text: "Postgres" }],
        }}
        value={null}
        onChange={(value, questionId) => onChange(value, questionId)}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Postgres/ }));
    // First arg is the response value, second arg is the question id (UUID).
    expect(onChange).toHaveBeenLastCalledWith("opt-a", "uuid-q");
  });
});