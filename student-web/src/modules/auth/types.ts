/**
 * Types mirroring the shapes returned by the live EMS student backend.
 * See Exam-Management-System-Service:
 *  - POST /students/login -> SessionsService.studentLogin
 *  - prisma/schema.prisma (ExamQuestion, Exam, ExamType, QuestionType)
 */

export type ExamType = "QUIZ" | "MIDTERM" | "FINAL" | "MOCK_EXIT";

export type QuestionType =
  | "TRUE_FALSE"
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_SELECT"
  | "MATCHING"
  | "FILL_BLANK"
  | "WORKOUT";

/** JSON value as stored by Prisma for question options / answers. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/** Body accepted by POST /students/login. */
export interface StudentLoginRequest {
  studentId: string;
  otp: string;
  handshakeToken: string;
}

/** Question payload sent to the student; `correctAnswer` is stripped server-side. */
export interface StudentExamQuestion {
  id: string;
  examId: string;
  sourceQuestionId: string | null;
  type: QuestionType;
  prompt: string;
  options: Json | null;
  points: number;
  order: number;
}

/** Exam summary returned as part of the login response. */
export interface StudentExam {
  id: string;
  title: string;
  examType: ExamType;
}

/** Full response of POST /students/login. */
export interface StudentLoginResponse {
  sessionToken: string;
  exam: StudentExam;
  endsAt: string;
  examQuestions: StudentExamQuestion[];
  student?: { name: string; studentId: string };
}
