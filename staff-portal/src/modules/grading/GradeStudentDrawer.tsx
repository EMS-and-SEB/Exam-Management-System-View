import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, CheckCircle2, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { gradeAnswerSchema, type GradeAnswerValues } from './validation/grading.schema';
import { useSessionAnswers, useGradeAnswer } from './hooks';
import type { AnswerDetail } from './api';

interface GradeStudentDrawerProps {
  examId: string;
  sessionId: string | null;
  sessionIds: string[];
  onOpenChange: (open: boolean) => void;
  onNavigate: (sessionId: string) => void;
}

interface AnswerOption {
  id: string;
  text: string;
}

interface MatchingOptions {
  left?: AnswerOption[];
  right?: AnswerOption[];
}

function SubmittedAnswer({ answer }: { answer: AnswerDetail }) {
  const options = answer.options as AnswerOption[] | MatchingOptions | undefined;

  if (answer.type === 'MATCHING' && Array.isArray((options as MatchingOptions | undefined)?.left)) {
    const matchingOptions = options as MatchingOptions;
    const leftById = new Map((matchingOptions.left ?? []).map((option) => [option.id, option.text]));
    const rightById = new Map((matchingOptions.right ?? []).map((option) => [option.id, option.text]));
    const pairs = Array.isArray(answer.responseData) ? answer.responseData as { leftId: string; rightId: string }[] : [];

    return (
      <div className="space-y-1 text-sm">
        {pairs.length > 0 ? pairs.map((pair, index) => (
          <p key={`${pair.leftId}-${pair.rightId}-${index}`}>
            <span className="font-medium">{leftById.get(pair.leftId) ?? pair.leftId}</span>
            <span className="mx-2 text-muted-foreground">&rarr;</span>
            <span>{rightById.get(pair.rightId) ?? pair.rightId}</span>
          </p>
        )) : <span className="text-muted-foreground">No answer submitted.</span>}
      </div>
    );
  }

  if ((answer.type === 'MULTIPLE_SELECT' || answer.type === 'MULTIPLE_CHOICE') && Array.isArray(options)) {
    const optionById = new Map(options.map((option) => [option.id, option.text]));
    const selectedIds = answer.type === 'MULTIPLE_SELECT'
      ? Array.isArray(answer.responseData) ? answer.responseData as string[] : []
      : typeof answer.responseData === 'string' ? [answer.responseData] : [];

    return (
      <div className="space-y-1 text-sm">
        {selectedIds.length > 0 ? selectedIds.map((id) => (
          <p key={id}>{optionById.get(id) ?? id}</p>
        )) : <span className="text-muted-foreground">No answer submitted.</span>}
      </div>
    );
  }

  return <pre className="text-sm whitespace-pre-wrap font-mono">{JSON.stringify(answer.responseData, null, 2)}</pre>;
}

function AnswerCard({ answer, onGrade, isPending }: { answer: AnswerDetail; onGrade: (v: GradeAnswerValues) => void; isPending: boolean }) {
  const isGraded = answer.gradedAt !== null;
  const isManual = answer.type === 'WORKOUT';

  const form = useForm<GradeAnswerValues>({
    resolver: zodResolver(gradeAnswerSchema),
    defaultValues: { pointsAwarded: answer.pointsAwarded ?? 0 },
  });

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <StatusBadge status={answer.type} />
          <span className="text-xs text-muted-foreground">{answer.points} pts</span>
        </div>
        <p className="text-sm">{answer.prompt}</p>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">Student's submitted answer</p>
          <SubmittedAnswer answer={answer} />
        </div>

        {!isManual ? (
          <div className="flex items-center gap-2 text-sm">
            {answer.isCorrect ? (
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Correct — Awarded {answer.pointsAwarded}/{answer.points} pts</span>
            ) : (
              <span className="text-red-600">Incorrect — Awarded {answer.pointsAwarded}/{answer.points} pts</span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">Auto-graded — locked</span>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onGrade)} className="flex items-end gap-2">
            <Field data-invalid={!!form.formState.errors.pointsAwarded} className="flex-1">
              <FieldLabel>Points Awarded</FieldLabel>
              <Input type="number" min={0} max={answer.points} step={0.5} {...form.register('pointsAwarded', { valueAsNumber: true })} />
              {form.formState.errors.pointsAwarded && <FieldError errors={[form.formState.errors.pointsAwarded]} />}
            </Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isGraded ? 'Update' : 'Grade'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function GradeStudentDrawer({ examId, sessionId, sessionIds, onOpenChange, onNavigate }: GradeStudentDrawerProps) {
  const { data, isLoading } = useSessionAnswers(sessionId ?? '');
  const gradeAnswer = useGradeAnswer(examId, sessionId ?? '');

  if (!sessionId) return null;

  const currentIndex = sessionIds.indexOf(sessionId);
  const graded = data?.answers.filter((a) => a.gradedAt !== null).length ?? 0;
  const total = data?.answers.length ?? 0;
  const tentativeScore = data?.answers.reduce((sum, a) => sum + (a.pointsAwarded ?? 0), 0) ?? 0;
  const maxScore = data?.answers.reduce((sum, a) => sum + a.points, 0) ?? 0;

  return (
    <DrawerShell
      open={!!sessionId}
      onOpenChange={onOpenChange}
      icon={<User className="h-4 w-4" />}
      title={data?.session.student.name ?? 'Loading...'}
      subtitle={data?.session.student.studentId}
      badge={total > 0 ? <StatusBadge status={graded === total ? 'GRADED' : 'NEEDS_GRADING'} /> : undefined}
      width="xl"
      footerLeft={total > 0 ? `Tentative Score: ${tentativeScore}/${maxScore} · ${graded}/${total} graded` : undefined}
      footer={
        <>
          <Button
            variant="outline"
            disabled={currentIndex <= 0}
            onClick={() => onNavigate(sessionIds[currentIndex - 1])}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            disabled={currentIndex >= sessionIds.length - 1}
            onClick={() => onNavigate(sessionIds[currentIndex + 1])}
          >
            Next Student <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading answers...</p>
      ) : (
        <div className="space-y-4">
          {data?.answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              isPending={gradeAnswer.isPending}
              onGrade={(values) => gradeAnswer.mutate({ answerId: answer.id, data: values })}
            />
          ))}
        </div>
      )}
    </DrawerShell>
  );
}