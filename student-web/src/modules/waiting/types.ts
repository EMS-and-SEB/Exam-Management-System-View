import type { ExamQuestion } from "../exam/types";

export interface WaitingPollResponse {
  status: string;
  startsAt?: string;
  serverNow?: string;
  durationMinutes?: number;
  endsAt?: string | null;
  questions?: unknown;
}

export interface StartSessionResponse {
  status: "IN_PROGRESS";
  endsAt: string;
  serverNow: string;
  examQuestions: ExamQuestion[];
}