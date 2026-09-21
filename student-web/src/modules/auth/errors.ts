/**
 * Maps documented backend login failures to student-facing copy.
 *
 * Keys mirror the exact messages thrown by SessionsService.studentLogin and the
 * HTTP status codes from AppException. Because the backend already distinguishes
 * each case with a distinct message, we match on message text; the status code is
 * used for cases that share a message shape (e.g. 409 for "session already
 * exists"). Anything not documented here surfaces the raw backend message rather
 * than guessing at UX copy.
 */

import type { AxiosError } from "axios";

interface BackendErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

export type ApiError = AxiosError<BackendErrorBody>;

interface LoginFailure {
  status?: number;
  message?: string;
}

export const LOGIN_FAILURE_COPY: Record<string, string> = {
  "Invalid or expired OTP.":
    "That OTP is invalid or has expired. Ask an invigilator for a fresh code.",
  "Exam is not available for login.":
    "This exam is not available to start right now.",
  "Exam has not started yet.": "This exam has not started yet.",
  "Login window has expired.":
    "Your login window has expired. Ask an invigilator for a fresh code.",
  "Student not found.":
    "We could not find a student with that ID. Double-check it and try again.",
  "You are not on this exam roster.":
    "You are not on the roster for this exam. Contact an invigilator.",
  "A session already exists for this student on this exam.":
    "You already have an active session for this exam.",
};

export function getLoginErrorMessage(failure: LoginFailure): string {
  if (failure.message && LOGIN_FAILURE_COPY[failure.message]) {
    return LOGIN_FAILURE_COPY[failure.message];
  }

  return (
    failure.message ??
    "Sign in failed. Check your details and try again."
  );
}