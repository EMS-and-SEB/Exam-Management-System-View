import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import type { FillBlankQuestion } from "../types";

interface Props {
  question: FillBlankQuestion;
  value: (string | null)[] | null;
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

/** Render the prompt with inline input fields in place of each {{n}} blank. */
export function FillBlankAnswer({ question, value, onChange, disabled }: Props) {
  const parts = useMemo(
    () => question.prompt.split(/\{\{\d+\}\}/),
    [question.prompt],
  );

  const blankCount = parts.length - 1;
  const current = value ?? Array.from({ length: blankCount }, () => "");

  const setBlank = (i: number, text: string) => {
    const next = [...current];
    next[i] = text;
    onChange(next);
  };

  const nodes: React.ReactNode[] = [];
  parts.forEach((text, i) => {
    nodes.push(
      <span key={`text-${i}`} className="whitespace-pre-wrap">
        {text}
      </span>,
    );
    if (i < blankCount) {
      nodes.push(
        <Input
          key={`blank-${i}`}
          data-testid={`fill-blank-${i}`}
          value={current[i] ?? ""}
          disabled={disabled}
          onChange={(e) => setBlank(i, e.target.value)}
          placeholder={`Blank ${i + 1}`}
          className="inline-block w-32 mx-1 align-baseline"
        />,
      );
    }
  });

  return (
    <p className="text-base leading-8" data-testid="fill-blank-prompt">
      {nodes}
    </p>
  );
}