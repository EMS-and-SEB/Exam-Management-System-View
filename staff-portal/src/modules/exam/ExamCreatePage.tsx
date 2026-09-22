import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/auth.store';
import { useCourses } from '@/modules/course/hooks';
import { useCohorts } from '@/modules/cohorts/hooks';
import { createExamSchema, examTypeOptions, type CreateExamValues } from './validation/exam.schema';
import { useCreateExam } from './hooks';

export function ExamCreatePage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user!.role);
  const createExam = useCreateExam();
  const { data: courses } = useCourses(role === 'INSTRUCTOR');
  const { data: cohorts } = useCohorts(role === 'EXIT_EXAM_COORDINATOR');

  const form = useForm<CreateExamValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues: { examType: role === 'EXIT_EXAM_COORDINATOR' ? 'MOCK_EXIT' : 'QUIZ', title: '', durationMinutes: 60 },
  });

  const availableExamTypes = role === 'EXIT_EXAM_COORDINATOR'
    ? examTypeOptions.filter((option) => option.value === 'MOCK_EXIT')
    : examTypeOptions.filter((option) => option.value !== 'MOCK_EXIT');

  const examType = useWatch({ control: form.control, name: 'examType' });
  const courseId = useWatch({ control: form.control, name: 'courseId' });
  const cohortId = useWatch({ control: form.control, name: 'cohortId' });
  const durationMinutes = useWatch({ control: form.control, name: 'durationMinutes' });
  const scope = courseId ? 'course' : cohortId ? 'cohort' : null;

  const onSubmit = (values: CreateExamValues) => {
    createExam.mutate(values, {
      onSuccess: (exam) => navigate(`/exams/${exam.id}`),
    });
  };

  return (
    <div>
      <PageHeader title="Create Exam" backTo="/exams" subtitle="Configure exam attributes, then attach questions and an invigilator once the draft is created." />

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-[1fr_320px] gap-6 max-w-5xl">
        <div className="space-y-5">
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-medium">Exam Details</p>

              <Field>
                <FieldLabel>Assessment Type</FieldLabel>
                <Controller
                  control={form.control}
                  name="examType"
                  render={({ field }) => (
                    <div className="grid grid-cols-4 gap-2">
                      {availableExamTypes.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`text-sm rounded-lg border px-2 py-2 ${
                            field.value === opt.value ? 'border-primary bg-primary/10 font-medium' : 'hover:bg-muted/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.title}>
                <FieldLabel>Exam Title</FieldLabel>
                <Input placeholder="e.g. Data Structures — Quiz 2" {...form.register('title')} />
                {form.formState.errors.title && <FieldError errors={[form.formState.errors.title]} />}
              </Field>

              <Field data-invalid={!!form.formState.errors.courseId}>
                <FieldLabel>Course or Cohort</FieldLabel>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  onChange={(e) => {
                    const [kind, id] = e.target.value.split(':');
                    form.setValue('courseId', kind === 'course' ? id : undefined);
                    form.setValue('cohortId', kind === 'cohort' ? id : undefined);
                  }}
                >
                  <option value="">Select target...</option>
                  {courses?.map((c) => <option key={c.id} value={`course:${c.id}`}>{c.name}</option>)}
                  {cohorts?.map((c) => <option key={c.id} value={`cohort:${c.id}`}>{c.name}</option>)}
                </select>
                {form.formState.errors.courseId && <FieldError errors={[form.formState.errors.courseId]} />}
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-medium">Schedule &amp; Duration</p>
              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!form.formState.errors.scheduledStart}>
                  <FieldLabel>Scheduled Start</FieldLabel>
                  <Input type="datetime-local" {...form.register('scheduledStart')} />
                  {form.formState.errors.scheduledStart && <FieldError errors={[form.formState.errors.scheduledStart]} />}
                </Field>
                <Field data-invalid={!!form.formState.errors.durationMinutes}>
                  <FieldLabel>Duration (minutes)</FieldLabel>
                  <Input type="number" min={1} {...form.register('durationMinutes', { valueAsNumber: true })} />
                  {form.formState.errors.durationMinutes && <FieldError errors={[form.formState.errors.durationMinutes]} />}
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-sm font-medium">Exam Summary</p>
              <dl className="text-sm space-y-1.5">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{examTypeOptions.find((t) => t.value === examType)?.label}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Scope</dt>
                  <dd>{scope ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd>{durationMinutes || 0}m</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={createExam.isPending}>
            {createExam.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Draft'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Questions and invigilator assignment are added on the next screen, once the draft is created.
          </p>
        </div>
      </form>
    </div>
  );
}