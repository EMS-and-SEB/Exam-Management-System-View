import { useState } from "react";
import type { MatchingQuestion } from "../types";

type Pair = { leftId: string; rightId: string };

interface Props {
  question: MatchingQuestion;
  value: Pair[];
  onChange: (value: Pair[]) => void;
  disabled?: boolean;
}

/** number→letter helper; group by index so TestIDs are stable. */
const letters = "abcdefghijklmnopqrstuvwxyz".split("");

export function MatchingAnswer({ question, value, onChange, disabled }: Props) {
  const [rightUseds] = useState<Map<string, string>>(() => new Map());

  const { left, right } = question.options;

  const assignedFor = (leftId: string) =>
    value.find((p) => p.leftId === leftId)?.rightId ?? "";

  const assign = (leftId: string, rightId: string) => {
    rightUseds.set(leftId, rightId);
    const next = value
      .filter((p) => p.leftId !== leftId)
      .concat(rightId ? [{ leftId, rightId }] : []);
    // Keep canonical left order.
    next.sort(
      (a, b) =>
        left.findIndex((l) => l.id === a.leftId) -
        left.findIndex((l) => l.id === b.leftId),
    );
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {left.map((item, li) => (
        <div key={item.id} className="flex items-center gap-3">
          <div className="flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            {letters[li]}. {item.text}
          </div>
          <select
            data-testid={`matching-select-${li}`}
            value={assignedFor(item.id)}
            disabled={disabled}
            onChange={(e) => assign(item.id, e.target.value)}
            className="h-9 w-48 rounded-lg border border-input bg-foreground/5 px-2 text-sm outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Select…</option>
            {right.map((r, ri) => (
              <option key={r.id} value={r.id}>
                {letters[ri]}. {r.text}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}