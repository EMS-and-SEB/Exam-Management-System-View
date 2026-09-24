import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFieldArrayReturn,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import type { QuestionInput, QuestionType } from "./validation/question.schema";

type Option = { id: string; text: string };
type MatchingOptions = { left: Option[]; right: Option[] };
type Pair = { leftId: string; rightId: string };
type FieldArrayValues = { options: Option[] };
type MatchingFieldArrayValues = {
  options: MatchingOptions;
  correctAnswer: Pair[];
};
type ErrorValues = { correctAnswer: string };

interface QuestionTypeFieldsProps {
  type: QuestionType;
  control: Control<QuestionInput>;
  setValue: UseFormSetValue<QuestionInput>;
  errors: FieldErrors<QuestionInput>;
}

function newOptionId() {
  return crypto.randomUUID();
}

export function QuestionTypeFields({
  type,
  control,
  setValue,
  errors,
}: QuestionTypeFieldsProps) {
  const correctAnswer = useWatch({
    control,
    name: "correctAnswer",
  }) as boolean | string | string[] | Pair[] | undefined;

  const leftOptions = useWatch({
    control,
    name: "options.left",
  }) as Option[] | undefined;

  const rightOptions = useWatch({
    control,
    name: "options.right",
  }) as Option[] | undefined;

  const optionValues = useWatch({
    control,
    name: "options",
  }) as Option[] | MatchingOptions | undefined;

  const multipleChoiceOptions = useFieldArray({
    control: control as unknown as Control<FieldArrayValues>,
    name: "options",
  }) as unknown as UseFieldArrayReturn<FieldArrayValues, "options">;

  const left = useFieldArray({
    control: control as unknown as Control<MatchingFieldArrayValues>,
    name: "options.left",
  }) as unknown as UseFieldArrayReturn<
    MatchingFieldArrayValues,
    "options.left"
  >;

  const right = useFieldArray({
    control: control as unknown as Control<MatchingFieldArrayValues>,
    name: "options.right",
  }) as unknown as UseFieldArrayReturn<
    MatchingFieldArrayValues,
    "options.right"
  >;

  const pairs = useFieldArray({
    control: control as unknown as Control<MatchingFieldArrayValues>,
    name: "correctAnswer" as const,
  }) as unknown as UseFieldArrayReturn<
    MatchingFieldArrayValues,
    "correctAnswer"
  >;

  const correctAnswerError = (errors as FieldErrors<ErrorValues>).correctAnswer;
  const multipleChoiceRegister =
    control.register as unknown as UseFormRegister<FieldArrayValues>;
  const matchingRegister =
    control.register as unknown as UseFormRegister<MatchingFieldArrayValues>;

  if (type === "TRUE_FALSE") {
    const value = correctAnswer;

    return (
      <Field>
        <FieldLabel>Correct Answer</FieldLabel>
        <RadioGroup
          value={String(value)}
          onValueChange={(v) => setValue("correctAnswer", v === "true")}
        >
          <label className="flex items-center gap-2">
            <RadioGroupItem value="true" />
            True
          </label>
          <label className="flex items-center gap-2">
            <RadioGroupItem value="false" />
            False
          </label>
        </RadioGroup>
      </Field>
    );
  }

  if (type === "MULTIPLE_CHOICE" || type === "MULTIPLE_SELECT") {
    const { fields, append, remove } = multipleChoiceOptions;
    const isMulti = type === "MULTIPLE_SELECT";

    const toggleCorrect = (optionId: string) => {
      if (isMulti) {
        const current =
          Array.isArray(correctAnswer) &&
          correctAnswer.every(
            (value): value is string => typeof value === "string",
          )
            ? correctAnswer
            : [];

        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];

        setValue("correctAnswer", next);
      } else {
        setValue("correctAnswer", optionId);
      }
    };

    return (
      <Field>
        <FieldLabel>
          Answer Choices —{" "}
          {isMulti ? "check all correct" : "select the correct one"}
        </FieldLabel>
        <div className="space-y-2">
          {fields.map((field, index) => {
            const optionId = Array.isArray(optionValues)
              ? (optionValues[index]?.id ?? "")
              : "";
            const isCorrect = isMulti
              ? Array.isArray(correctAnswer) &&
                correctAnswer.some((value) => value === optionId)
              : correctAnswer === optionId;
            return (
              <div key={field.id} className="flex items-center gap-2">
                {isMulti ? (
                  <Checkbox
                    checked={isCorrect}
                    onCheckedChange={() => toggleCorrect(optionId)}
                  />
                ) : (
                  <input
                    type="radio"
                    checked={isCorrect}
                    onChange={() => toggleCorrect(optionId)}
                    className="h-4 w-4"
                  />
                )}
                <Input
                  placeholder={`Option ${index + 1}`}
                  {...multipleChoiceRegister(`options.${index}.text`)}
                  className={isCorrect ? "border-emerald-400" : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ id: newOptionId(), text: "" })}
        >
          <Plus className="h-4 w-4" /> Add Option
        </Button>
        {correctAnswerError && <FieldError errors={[correctAnswerError]} />}
      </Field>
    );
  }

  if (type === "MATCHING") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Left Items</FieldLabel>
            {left.fields.map((f, i) => (
              <div key={f.id} className="flex gap-2 mb-2">
                <Input
                  placeholder={`Left ${i + 1}`}
                  {...matchingRegister(`options.left.${i}.text`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => left.remove(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => left.append({ id: newOptionId(), text: "" })}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </Field>
          <Field>
            <FieldLabel>Right Items</FieldLabel>
            {right.fields.map((f, i) => (
              <div key={f.id} className="flex gap-2 mb-2">
                <Input
                  placeholder={`Right ${i + 1}`}
                  {...matchingRegister(`options.right.${i}.text`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => right.remove(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => right.append({ id: newOptionId(), text: "" })}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </Field>
        </div>

        <Field>
          <FieldLabel>Correct Pairs</FieldLabel>
          {pairs.fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2 mb-2">
              <select
                className="flex-1 rounded-md border px-2 py-1.5 text-sm bg-background"
                {...matchingRegister(`correctAnswer.${i}.leftId`)}
              >
                <option value="">Select left...</option>
                {leftOptions?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.text || "(empty)"}
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground">→</span>
              <select
                className="flex-1 rounded-md border px-2 py-1.5 text-sm bg-background"
                {...matchingRegister(`correctAnswer.${i}.rightId`)}
              >
                <option value="">Select right...</option>
                {rightOptions?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.text || "(empty)"}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => pairs.remove(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pairs.append({ leftId: "", rightId: "" })}
          >
            <Plus className="h-4 w-4" /> Add Pair
          </Button>
          {correctAnswerError && <FieldError errors={[correctAnswerError]} />}
        </Field>
      </div>
    );
  }

  if (type === "FILL_BLANK") {
    const answers =
      Array.isArray(correctAnswer) &&
      correctAnswer.every((value): value is string => typeof value === "string")
        ? correctAnswer
        : [];

    return (
      <Field>
        <FieldLabel>Correct Answers</FieldLabel>
        <p className="text-xs text-muted-foreground mb-2">
          One answer per blank, in order. Add blanks to the prompt with{" "}
          <code>{"{{1}}"}</code>, <code>{"{{2}}"}</code>, <code>{"{{3}}"}</code>
          .
        </p>
        {answers.map((answer, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground w-8">#{i + 1}</span>
            <Input
              placeholder={`Answer for blank ${i + 1}`}
              value={answer}
              onChange={(event) => {
                const next = [...answers];
                next[i] = event.target.value;
                setValue("correctAnswer", next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setValue(
                  "correctAnswer",
                  answers.filter((_, index) => index !== i),
                )
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setValue("correctAnswer", [...answers, ""])}
        >
          <Plus className="h-4 w-4" /> Add Blank Answer
        </Button>
        {correctAnswerError && <FieldError errors={[correctAnswerError]} />}
      </Field>
    );
  }

  return (
    <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4">
      Workout questions are graded manually from the student's free-text
      response — no answer key is configured here.
    </p>
  );
}
