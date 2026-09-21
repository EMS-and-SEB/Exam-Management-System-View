import { useId } from "react";
import type { WorkoutQuestion } from "../types";

interface Props {
  question: WorkoutQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function WorkoutAnswer({ value, onChange, disabled }: Props) {
  const id = useId();
  return (
    <textarea
      id={id}
      data-testid="workout-answer"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Show your working here…"
      className="min-h-40 w-full rounded-lg border border-input bg-foreground/5 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}