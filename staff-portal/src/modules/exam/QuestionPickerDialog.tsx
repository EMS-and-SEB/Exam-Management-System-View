import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useQuestions } from '@/modules/questions/hooks';
import type { Question } from '@/modules/questions/api';

interface QuestionPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent: { courseId?: string; cohortId?: string };
  excludeIds: string[];
  onConfirm: (questionIds: string[]) => void;
  isPending: boolean;
}

export function QuestionPickerDialog({ open, onOpenChange, parent, excludeIds, onConfirm, isPending }: QuestionPickerDialogProps) {
  const { data: questions } = useQuestions(parent);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const available: Question[] = (questions ?? []).filter((q) => !excludeIds.includes(q.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Browse Question Bank</DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {available.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No unused questions available.</p>}
          {available.map((q) => (
            <label key={q.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
              <Checkbox checked={selected.has(q.id)} onCheckedChange={() => toggle(q.id)} className="mt-0.5" />
              <div>
                <StatusBadge status={String(q.type)} />
                <p className="text-sm mt-1">{q.prompt}</p>
                <p className="text-xs text-muted-foreground">{q.points} pts</p>
              </div>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={selected.size === 0 || isPending} onClick={() => onConfirm([...selected])}>
            Add {selected.size > 0 ? `(${selected.size})` : ''} Questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}