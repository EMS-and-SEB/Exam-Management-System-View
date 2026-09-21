/**
 * Exam-taking types for the student web.
 *
 * Concrete payload shapes mirror what the live backend compares in
 * SessionsService.isCorrectAnswer(), NOT the SDD prose. Every answer type
 * must produce the exact `responseData` shape listed here or it silently
 * grades as wrong:
 *
 *   TRUE_FALSE        -> boolean
 *   MULTIPLE_CHOICE   -> string            (selected option id)
 *   MULTIPLE_SELECT   -> string[]          (selected option ids; set comparison)
 *   MATCHING          -> { leftId; rightId }[]  (one pair per left item)
 *   FILL_BLANK        -> string[]          (one string per {{n}} blank, in order)
 *   WORKOUT           -> free text (never auto-graded by the backend)
 *
 * `responseData: null` clears an answer (upsert supports it).
 */

import type { Json } from "@/modules/auth/types";

/** One selectable option for MULTIPLE_CHOICE / MULTIPLE_SELECT. */
export interface Option {
  id: string;
  text: string;
}

/** MATCHING options: a list of left items and the pool of right items. */
export interface MatchingOptions {
  left: Option[];
  right: Option[];
}

/** Server-sent question; `correctAnswer` is stripped before it reaches us. */
export interface BaseQuestion {
  id: string;
  examId: string;
  sourceQuestionId: string | null;
  prompt: string;
  options: Json | null;
  points: number;
  order: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "TRUE_FALSE";
  prompt: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "MULTIPLE_CHOICE";
  options: Option[];
}

export interface MultipleSelectQuestion extends BaseQuestion {
  type: "MULTIPLE_SELECT";
  options: Option[];
}

export interface MatchingQuestion extends BaseQuestion {
  type: "MATCHING";
  prompt: string;
  options: MatchingOptions;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "FILL_BLANK";
  prompt: string;
  /** True when the prompt carries literal {{n}} placeholders to render inline. */
  blanks: number;
}

export interface WorkoutQuestion extends BaseQuestion {
  type: "WORKOUT";
  prompt: string;
}

export type ExamQuestion =
  | TrueFalseQuestion
  | MultipleChoiceQuestion
  | MultipleSelectQuestion
  | MatchingQuestion
  | FillBlankQuestion
  | WorkoutQuestion;

/** The `responseData` each question type accepts (what we POST to /answers). */
export type AnswerValue =
  | boolean
  | string
  | string[]
  | { leftId: string; rightId: string }[]
  | null;

/** Local answer record + per-question save state. `offline` means a
 * transient network failure is being retried with backoff (distinct from the
 * incident-lockout state, which lives on the store as `locked`). */
export type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

export interface AnswerState {
  value: AnswerValue;
  status: SaveStatus;
}

/** GET /sessions/:id -> in-progress body. */
export interface SessionPollLive {
  status: "IN_PROGRESS" | "NOT_STARTED";
  endsAt: string;
  questions: ExamQuestion[];
}

export type SessionStatus = "IN_PROGRESS" | "NOT_STARTED" | "SUBMITTED" | "FORCE_SUBMITTED" | "EXPIRED";

/** Terminal body returned by GET /sessions/:id and POST /sessions/:id/submit. */
export interface SessionSummary {
  status: SessionStatus;
  submittedAt: string | null;
  /** Only present when every question is auto-graded (no WORKOUT). */
  score?: number;
  maxScore?: number;
}

/** Body of POST /sessions/:id/answers. */
export interface SaveAnswerRequest {
  examQuestionId: string;
  responseData: AnswerValue;
}