import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MultipleChoiceQuestion } from "../types";

interface Props {
  question: MultipleChoiceQuestion;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MultipleChoiceAnswer({ question, value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt, i) => {
        const selected = value === opt.id;
        return (
          <Button
            key={opt.id}
            type="button"
            variant={selected ? "default" : "outline"}
            className={cn(
              "justify-start h-auto py-3 text-left",
              disabled && "pointer-events-none opacity-60",
            )}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
          >
            <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs">
              {String.fromCharCode(65 + i)}
            </span>
            {opt.text}
          </Button>
        );
      })}
    </div>
  );
}