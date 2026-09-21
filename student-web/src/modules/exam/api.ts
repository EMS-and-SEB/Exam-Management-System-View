import { http } from "@/lib/axios";
import type {
  AnswerValue,
  ExamQuestion,
  SaveAnswerRequest,
  SessionPollLive,
  SessionSummary,
} from "./types";

/** GET /sessions/:id — reconcile live questions and detect a terminal status. */
function getSession(sessionId: string): Promise<SessionPollLive | SessionSummary> {
  return http.get(`/sessions/${sessionId}`).then((r) => r.data);
}

/** POST /sessions/:id/answers — upsert; safe to repeat with the same value. */
function saveAnswer(
  sessionId: string,
  req: SaveAnswerRequest,
): Promise<{ saved: true }> {
  return http.post(`/sessions/${sessionId}/answers`, req).then((r) => r.data);
}

/** POST /sessions/:id/submit — idempotent server-side. */
function submitExam(sessionId: string): Promise<SessionSummary> {
  return http.post(`/sessions/${sessionId}/submit`).then((r) => r.data);
}

export const examApi = {
  getSession,
  saveAnswer,
  submitExam,
};

export function isPollLive(
  body: SessionPollLive | SessionSummary,
): body is SessionPollLive {
  return "questions" in body;
}

export function isPollSummary(
  body: SessionPollLive | SessionSummary,
): body is SessionSummary {
  return "submittedAt" in body;
}

/** Narrow an unknown server question to our typed union. */
export function toExamQuestion(q: unknown): ExamQuestion {
  return q as ExamQuestion;
}

export type { ExamQuestion, AnswerValue };