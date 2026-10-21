import type { AnswerValue, ExamQuestion } from "../types";
import { TrueFalseAnswer } from "./TrueFalseAnswer";
import { MultipleChoiceAnswer } from "./MultipleChoiceAnswer";
import { MatchingAnswer } from "./MatchingAnswer";
import { FillBlankAnswer } from "./FillBlankAnswer";
import { WorkoutAnswer } from "./WorkoutAnswer";

interface Props {
  question: ExamQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue, questionId: string) => void;
  disabled?: boolean;
}

function isStringArray(value: AnswerValue): value is string[] {
  return Array.isArray(value) && value.every((item): item is string => typeof item === "string");
}

function isMatchingPairs(value: AnswerValue): value is { leftId: string; rightId: string }[] {
  return Array.isArray(value) && value.every(
    (item) => typeof item === "object" && item !== null &&
      "leftId" in item && typeof item.leftId === "string" &&
      "rightId" in item && typeof item.rightId === "string",
  );
}

/** Picks the right pure controlled input per question type. */
export function QuestionRenderer({ question, value, onChange, disabled }: Props) {
  switch (question.type) {
    case "TRUE_FALSE":
      return (
        <TrueFalseAnswer
          question={question}
          value={typeof value === "boolean" ? value : null}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceAnswer
          question={question}
          value={typeof value === "string" || isStringArray(value) ? value : null}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    case "MATCHING":
      return (
        <MatchingAnswer
          question={question}
          value={isMatchingPairs(value) ? value : []}
          disabled={disabled}
          onChange={(v) => onChange(v, question.id)}
        />
      );
    case "FILL_BLANK":
      return (
        <FillBlankAnswer
          question={question}
          value={isStringArray(value) ? value : null}
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
