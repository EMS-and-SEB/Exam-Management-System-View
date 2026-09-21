import type { AnswerValue, ExamQuestion } from "../types";
import { TrueFalseAnswer } from "./TrueFalseAnswer";
import { MultipleChoiceAnswer } from "./MultipleChoiceAnswer";
import { MultipleSelectAnswer } from "./MultipleSelectAnswer";
import { MatchingAnswer } from "./MatchingAnswer";
import { FillBlankAnswer } from "./FillBlankAnswer";
import { WorkoutAnswer } from "./WorkoutAnswer";

interface Props {
  question: ExamQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue, questionId: string) => void;
  disabled?: boolean;
}

/** Picks the right pure controlled input per question type. */
export function QuestionRenderer({ question, value, onChange, disabled }: Props) {
  switch (question.type) {
    case "TRUE_FALSE":
      return (
        <TrueFalseAnswer
          question={question}
          value={(value as boolean) ?? null}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceAnswer
          question={question}
          value={typeof value === "string" ? value : null}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    case "MULTIPLE_SELECT":
      return (
        <MultipleSelectAnswer
          question={question}
          value={Array.isArray(value) ? value : []}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    case "MATCHING":
      return (
        <MatchingAnswer
          question={question}
          value={Array.isArray(value) ? value : []}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    case "FILL_BLANK":
      return (
        <FillBlankAnswer
          question={question}
          value={Array.isArray(value) ? value : null}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    case "WORKOUT":
      return (
        <WorkoutAnswer
          question={question}
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    default:
      return null;
  }
}