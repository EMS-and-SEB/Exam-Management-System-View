import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { MultipleSelectQuestion } from "../types";

interface Props {
  question: MultipleSelectQuestion;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function MultipleSelectAnswer({ question, value, onChange, disabled }: Props) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt, i) => {
        const selected = value.includes(opt.id);
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
            onClick={() => toggle(opt.id)}
          >
            <span
              className={cn(
                "mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs",
                selected && "bg-background text-foreground",
              )}
            >
              {selected ? <Check className="h-3.5 w-3.5" /> : String.fromCharCode(65 + i)}
            </span>
            {opt.text}
          </Button>
        );
      })}
    </div>
  );
}