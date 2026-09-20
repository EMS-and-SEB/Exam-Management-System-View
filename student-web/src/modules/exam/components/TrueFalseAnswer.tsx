import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TrueFalseQuestion } from "../types";

interface Props {
  question: TrueFalseQuestion;
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function TrueFalseAnswer({ value, onChange, disabled }: Props) {
  const options = [
    { key: true, label: "True" },
    { key: false, label: "False" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((o) => {
        const selected = value === o.key;
        return (
          <Button
            key={String(o.key)}
            type="button"
            variant={selected ? "default" : "outline"}
            className={cn("h-12 text-base", disabled && "pointer-events-none opacity-60")}
            disabled={disabled}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </Button>
        );
      })}
    </div>
  );
}