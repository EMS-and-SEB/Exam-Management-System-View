import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { DrawerShell } from '@/components/shared/DrawerShell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QuestionTypeFields } from './QuestionTypeFields';
import { questionInputSchema, questionTypeOptions, type QuestionInput, type QuestionType } from './validation/question.schema';
import { useCreateQuestions, useUpdateQuestion } from './hooks';
import type { Question } from './api';

interface ParentRef {
  courseId?: string;
  cohortId?: string;
}

interface QuestionFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent: ParentRef;
  question?: Question | null; 
}

function defaultsForType(type: QuestionType): Partial<QuestionInput> {
  switch (type) {
    case 'TRUE_FALSE': return { type, prompt: '', points: 1, correctAnswer: true };
    case 'MULTIPLE_CHOICE': return { type, prompt: '', points: 1, options: [{ id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' }], correctAnswer: '' };
    case 'MULTIPLE_SELECT': return { type, prompt: '', points: 1, options: [{ id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' }], correctAnswer: [] };
    case 'MATCHING': return { type, prompt: '', points: 1, options: { left: [], right: [] }, correctAnswer: [] };
    case 'FILL_BLANK': return { type, prompt: '', points: 1, correctAnswer: [''] };
    case 'WORKOUT': return { type, prompt: '', points: 1 };
  }
}

export function QuestionFormDrawer({ open, onOpenChange, parent, question }: QuestionFormDrawerProps) {
  const isEdit = !!question;
  const createQuestions = useCreateQuestions(parent);
  const updateQuestion = useUpdateQuestion(parent);

  const form = useForm<QuestionInput>({
    resolver: zodResolver(questionInputSchema),
    defaultValues: defaultsForType('MULTIPLE_CHOICE') as QuestionInput,
  });


  const selectedType = useWatch({
    control: form.control,
    name: 'type',
  });

const { reset } = form;

useEffect(() => {
  if (question) {
    reset(question as QuestionInput);
  } else {
    reset(defaultsForType('MULTIPLE_CHOICE') as QuestionInput);
  }
}, [question, open, reset]);

  const onSubmit = (values: QuestionInput) => {
    if (isEdit && question) {
      updateQuestion.mutate({ id: question.id, data: values }, { onSuccess: () => onOpenChange(false) });
    } else {
      createQuestions.mutate({ type: values.type, questions: [values] }, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createQuestions.isPending || updateQuestion.isPending;

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      icon={<BookOpen className="h-4 w-4" />}
      title={isEdit ? 'Edit Question' : 'New Question'}
      badge={<StatusBadge status={selectedType} label={questionTypeOptions.find((t) => t.value === selectedType)?.label} />}
      width="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Question'}
          </Button>
        </>
      }
    >
      <form className="space-y-5">
        {!isEdit && (
          <Field>
            <FieldLabel>Question Type</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {questionTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => form.reset(defaultsForType(opt.value) as QuestionInput)}
                  className={`text-sm rounded-lg border px-2 py-2 ${
                    selectedType === opt.value ? 'border-primary bg-primary/10 font-medium' : 'hover:bg-muted/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
        )}

        <div className="grid grid-cols-[1fr_100px] gap-3">
          <Field data-invalid={!!form.formState.errors.prompt}>
            <FieldLabel>Question Prompt</FieldLabel>
            <Textarea rows={3} {...form.register('prompt')} />
            {form.formState.errors.prompt && <FieldError errors={[form.formState.errors.prompt]} />}
          </Field>
          <Field data-invalid={!!form.formState.errors.points}>
            <FieldLabel>Points</FieldLabel>
            <Input type="number" min={1} {...form.register('points', { valueAsNumber: true })} />
            {form.formState.errors.points && <FieldError errors={[form.formState.errors.points]} />}
          </Field>
        </div>

        <QuestionTypeFields
          type={selectedType}
          control={form.control}
          setValue={form.setValue}
          errors={form.formState.errors}
        />
      </form>
    </DrawerShell>
  );
}