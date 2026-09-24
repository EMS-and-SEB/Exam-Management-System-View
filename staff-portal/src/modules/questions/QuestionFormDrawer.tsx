import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Loader2, Plus, Trash2 } from 'lucide-react';
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

export interface QuestionEditorRef {
  validateAndGet: () => Promise<QuestionInput | null>;
}

function defaultsForType(type: QuestionType): QuestionInput {
  switch (type) {
    case 'TRUE_FALSE': return { type, prompt: '', points: 1, correctAnswer: true };
    case 'MULTIPLE_CHOICE': return { type, prompt: '', points: 1, options: [{ id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' }], correctAnswer: '' };
    case 'MULTIPLE_SELECT': return { type, prompt: '', points: 1, options: [{ id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' }], correctAnswer: [] };
    case 'MATCHING': return { type, prompt: '', points: 1, options: { left: [], right: [] }, correctAnswer: [] };
    case 'FILL_BLANK': return { type, prompt: '', points: 1, correctAnswer: [''] };
    case 'WORKOUT': return { type, prompt: '', points: 1 };
  }
}

const QuestionEditor = forwardRef<QuestionEditorRef, { type: QuestionType; initialValue?: QuestionInput; onRemove?: () => void }>(
  function QuestionEditor({ type, initialValue, onRemove }, ref) {
    const form = useForm<QuestionInput>({
      resolver: zodResolver(questionInputSchema),
      defaultValues: initialValue ?? defaultsForType(type),
    });

    useEffect(() => {
      form.reset(initialValue ?? defaultsForType(type));
    }, [type, initialValue, form]);

    useImperativeHandle(ref, () => ({
      validateAndGet: async () => (await form.trigger() ? form.getValues() : null),
    }), [form]);

    return (
      <div className="space-y-5 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Question</p>
          {onRemove && (
            <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>

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
          type={type}
          control={form.control}
          setValue={form.setValue}
          errors={form.formState.errors}
        />
      </div>
    );
  },
);

export function QuestionFormDrawer({ open, onOpenChange, parent, question }: QuestionFormDrawerProps) {
  const isEdit = !!question;
  const createQuestions = useCreateQuestions(parent);
  const updateQuestion = useUpdateQuestion(parent);
  const [selectedType, setSelectedType] = useState<QuestionType>(question?.type as QuestionType ?? 'MULTIPLE_CHOICE');
  const [questionKeys, setQuestionKeys] = useState([0]);
  const editorRefs = useRef<Record<number, QuestionEditorRef | null>>({});

  useEffect(() => {
    if (question) {
      setSelectedType(question.type as QuestionType);
      setQuestionKeys([0]);
    } else if (open) {
      setSelectedType('MULTIPLE_CHOICE');
      setQuestionKeys([0]);
    }
  }, [question, open]);

  const isPending = createQuestions.isPending || updateQuestion.isPending;
  const editorValue = question ? question as QuestionInput : undefined;

  const submitBatch = async () => {
    const questions = await Promise.all(
      questionKeys.map((key) => editorRefs.current[key]?.validateAndGet() ?? Promise.resolve(null)),
    );
    if (questions.some((value) => value === null)) return;

    if (isEdit && question) {
      updateQuestion.mutate({ id: question.id, data: questions[0] as QuestionInput }, {
        onSuccess: () => onOpenChange(false),
      });
      return;
    }

    createQuestions.mutate({ type: selectedType, questions: questions as QuestionInput[] }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      icon={<BookOpen className="h-4 w-4" />}
      title={isEdit ? 'Edit Question' : 'New Questions'}
      badge={<StatusBadge status={selectedType} label={questionTypeOptions.find((t) => t.value === selectedType)?.label} />}
      width="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submitBatch} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Changes' : `Create ${questionKeys.length} Question${questionKeys.length === 1 ? '' : 's'}`}
          </Button>
        </>
      }
    >
      {!isEdit && (
        <Field>
          <FieldLabel>Question Type</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {questionTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedType(option.value);
                  setQuestionKeys([0]);
                }}
                className={`rounded-lg border px-2 py-2 text-sm ${selectedType === option.value ? 'border-primary bg-primary/10 font-medium' : 'hover:bg-muted/50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>
      )}

      <div className="mt-5 space-y-4">
        {questionKeys.map((key) => (
          <QuestionEditor
            key={key}
            ref={(editor) => { editorRefs.current[key] = editor; }}
            type={selectedType}
            initialValue={editorValue}
            onRemove={questionKeys.length > 1 ? () => setQuestionKeys((keys) => keys.filter((value) => value !== key)) : undefined}
          />
        ))}
      </div>

      {!isEdit && (
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={() => setQuestionKeys((keys) => [...keys, Math.max(...keys, 0) + 1])}
        >
          <Plus className="h-4 w-4" /> Add Another Question
        </Button>
      )}
    </DrawerShell>
  );
}
