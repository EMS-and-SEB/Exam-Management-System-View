import type { MatchingQuestion } from "../types";

type Pair = { leftId: string; rightId: string };

interface Props {
  question: MatchingQuestion;
  value: Pair[];
  onChange: (value: Pair[]) => void;
  disabled?: boolean;
}

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

export function MatchingAnswer({ question, value, onChange, disabled }: Props) {
  const { left, right } = question.options;

  const assignedFor = (leftId: string) =>
    value.find((p) => p.leftId === leftId)?.rightId ?? "";

  const assign = (leftId: string, rightId: string) => {
    const next = value
      .filter((p) => p.leftId !== leftId)
      .concat(rightId ? [{ leftId, rightId }] : []);
    next.sort(
      (a, b) =>
        left.findIndex((l) => l.id === a.leftId) -
        left.findIndex((l) => l.id === b.leftId),
    );
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        {left.map((item, li) => (
          <div key={item.id} className="flex items-center gap-2">
            <select
              data-testid={`matching-select-${li}`}
              value={assignedFor(item.id)}
              disabled={disabled}
              onChange={(e) => assign(item.id, e.target.value)}
              className="h-9 w-16 rounded-lg border border-input bg-foreground/5 px-2 text-sm outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">—</option>
              {right.map((r, ri) => (
                <option key={r.id} value={r.id}>
                  {letters[ri]}
                </option>
              ))}
            </select>
            <div className="flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              {li + 1}. {item.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {right.map((r, ri) => (
          <div
            key={r.id}
            className="rounded-lg border bg-muted/20 px-3 py-2 text-sm"
          >
            {letters[ri]}. {r.text}
          </div>
        ))}
      </div>
    </div>
  );
}
