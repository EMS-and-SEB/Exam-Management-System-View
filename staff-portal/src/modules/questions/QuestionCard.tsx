import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { questionTypeOptions } from './validation/question.schema';
import type { Question } from './api';

interface QuestionCardProps {
  question: Question;
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  const typeLabel = questionTypeOptions.find((t) => t.value === question.type)?.label;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={question.type} label={typeLabel} />
            <span className="text-xs text-muted-foreground">{question.points} pts</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button>
          </div>
        </div>
        <p className="text-sm mt-2">{question.prompt}</p>
      </CardContent>
    </Card>
  );
}