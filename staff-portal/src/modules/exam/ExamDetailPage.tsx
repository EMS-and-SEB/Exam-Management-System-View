import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useStaffSearch } from '@/modules/staff/hooks';
import {
  useExam, useExamQuestions, useAttachQuestions, useDetachQuestion,
  useAssignInvigilator, useReleaseExam, useCloseExam,
} from './hooks';
import { QuestionPickerDialog } from './QuestionPickerDialog';
import { examTypeOptions } from './validation/exam.schema';

export function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const examId = id!;

  const { data: exam, isLoading } = useExam(examId);
  const { data: examQuestions } = useExamQuestions(examId);
  const attachQuestions = useAttachQuestions(examId);
  const detachQuestion = useDetachQuestion(examId);
  const assignInvigilator = useAssignInvigilator(examId);
  const releaseExam = useReleaseExam(examId);
  const closeExam = useCloseExam(examId);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [invigilatorQuery, setInvigilatorQuery] = useState('');
  const debouncedQuery = useDebouncedValue(invigilatorQuery);
  const { data: invigilatorResults, isFetching } = useStaffSearch(debouncedQuery, 'INVIGILATOR');

  if (isLoading || !exam) return <LoadingState label="Loading exam..." />;

  const parent = exam.courseId ? { courseId: exam.courseId } : { cohortId: exam.cohortId! };
  const isDraft = exam.status === 'DRAFT';
  const isReleased = exam.status === 'RELEASED';
  const totalPoints = (examQuestions ?? []).reduce((sum, q) => sum + q.points, 0);

  return (
    <div>
      <PageHeader
        title={exam.title}
        backTo="/exams"
        badge={<><StatusBadge status={exam.examType} label={examTypeOptions.find((t) => t.value === exam.examType)?.label} /> <StatusBadge status={exam.status} /></>}
        subtitle={exam.course?.name ?? exam.cohort?.name}
        actions={
          <>
            {isDraft && (
              <Button
                onClick={() => setReleaseOpen(true)}
                disabled={!exam.scheduledStart || (examQuestions ?? []).length === 0}
              >
                Release Exam
              </Button>
            )}
            {isReleased && (
              <Button onClick={() => closeExam.mutate()} disabled={closeExam.isPending}>
                Close Exam
              </Button>
            )}
          </>
        }
      />

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardContent className="p-5 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Scheduled</span><span>{exam.scheduledStart ? format(new Date(exam.scheduledStart), 'MMM d, yyyy h:mm a') : '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{exam.durationMinutes} min</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Questions</span><span>{examQuestions?.length ?? 0} · {totalPoints} pts</span></div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Questions</p>
              {isDraft && (
                <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                  <Plus className="h-4 w-4" /> Browse Bank
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {(examQuestions ?? []).map((q) => (
                <div key={q.id} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <StatusBadge status={q.type} />
                    <p className="text-sm mt-1 truncate">{q.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{q.points} pts</span>
                    {isDraft && (
                      <Button variant="ghost" size="icon" onClick={() => detachQuestion.mutate(q.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {(examQuestions ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                  No questions attached yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <Card className="h-fit">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-medium">Assigned Invigilator</p>
            {isDraft ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search staff..." className="pl-9" value={invigilatorQuery} onChange={(e) => setInvigilatorQuery(e.target.value)} />
                </div>
                {isFetching && <p className="text-xs text-muted-foreground">Searching...</p>}
                {invigilatorResults?.map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => assignInvigilator.mutate(staff.id)}
                    className="w-full text-left p-2 text-sm rounded-lg border hover:bg-muted/50"
                  >
                    {staff.name} <span className="text-muted-foreground">— {staff.email}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Locked once released — invigilator can no longer be reassigned here.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <QuestionPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        parent={parent}
        excludeIds={(examQuestions ?? []).map((q) => q.sourceQuestionId).filter(Boolean) as string[]}
        onConfirm={(ids) => attachQuestions.mutate(ids, { onSuccess: () => setPickerOpen(false) })}
        isPending={attachQuestions.isPending}
      />

      <ConfirmDialog
        open={releaseOpen}
        onOpenChange={setReleaseOpen}
        title="Release this exam?"
        description="This will finalize the roster, generate the access OTP, and lock questions and invigilator assignment. This cannot be undone."
        confirmLabel="Release"
        isLoading={releaseExam.isPending}
        onConfirm={() => releaseExam.mutate(undefined, { onSuccess: () => setReleaseOpen(false) })}
      />
    </div>
  );
}