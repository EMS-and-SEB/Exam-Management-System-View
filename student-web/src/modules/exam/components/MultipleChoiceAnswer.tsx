import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { MultipleChoiceQuestion } from "../types";

interface Props {
  question: MultipleChoiceQuestion;
  value: string | string[] | null;
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}

export function MultipleChoiceAnswer({ question, value, onChange, disabled }: Props) {
  const isMulti = question.correctAnswerCount > 1;
  const selectedIds = Array.isArray(value) ? value : value ? [value] : [];
  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((selected) => selected !== id) : [...selectedIds, id]);

  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt, i) => {
        const selected = selectedIds.includes(opt.id);
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
            onClick={() => isMulti ? toggle(opt.id) : onChange(opt.id)}
          >
            <span className={cn("mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center border text-xs", isMulti ? "rounded" : "rounded-full")}>
              {isMulti && selected ? <Check className="h-3.5 w-3.5" /> : String.fromCharCode(65 + i)}
            </span>
            {opt.text}
          </Button>
        );
      })}
    </div>
  );
}
