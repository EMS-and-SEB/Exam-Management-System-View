import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useQuestions, useDeleteQuestion } from './hooks';
import { QuestionCard } from './QuestionCard';
import { QuestionFormDrawer } from './QuestionFormDrawer';
import { questionTypeOptions } from './validation/question.schema';
import type { Question } from './api';

export function QuestionBankPage() {
  const { courseId, cohortId } = useParams<{ courseId?: string; cohortId?: string }>();
  const parent = courseId ? { courseId } : { cohortId };

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);

  const { data: questions, isLoading } = useQuestions(parent);
  const deleteQuestion = useDeleteQuestion(parent);

  const filtered = (questions ?? []).filter((q) => q.prompt.toLowerCase().includes(search.toLowerCase()));

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    (questions ?? []).forEach((q) => { counts[q.type] = (counts[q.type] ?? 0) + 1; });
    return questionTypeOptions.map((t) => ({ ...t, count: counts[t.value] ?? 0 }));
  }, [questions]);

  const total = questions?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Question Bank"
        badge={`${total} Total`}
        actions={
          <Button onClick={() => { setEditingQuestion(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        }
      />

      <div className="grid grid-cols-[1fr_260px] gap-6">
        <div>
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by prompt keywords..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {isLoading ? (
            <LoadingState label="Loading questions..." />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">No questions found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onEdit={() => { setEditingQuestion(q); setFormOpen(true); }}
                  onDelete={() => setDeleteTarget(q)}
                />
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Type Distribution</p>
            {distribution.map((t) => (
              <div key={t.value} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{t.label}</span>
                  <span className="text-muted-foreground">{t.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: total > 0 ? `${(t.count / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <QuestionFormDrawer open={formOpen} onOpenChange={setFormOpen} parent={parent} question={editingQuestion} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this question?"
        description="If this question has already been used in an exam, it will be archived instead of permanently deleted."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteQuestion.isPending}
        onConfirm={() => deleteTarget && deleteQuestion.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
}