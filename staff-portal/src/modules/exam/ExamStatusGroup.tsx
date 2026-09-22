import type { Exam } from './api';

export type ExamGroup = 'draft' | 'upcoming' | 'active' | 'completed';

export function groupExam(exam: Exam): ExamGroup {
  if (exam.status === 'DRAFT') return 'draft';
  if (exam.status === 'CLOSED') return 'completed';

  const start = exam.scheduledStart ? new Date(exam.scheduledStart) : null;
  const end = start && exam.durationMinutes ? new Date(start.getTime() + exam.durationMinutes * 60_000) : null;
  const now = new Date();

  if (start && now < start) return 'upcoming';
  if (end && now > end) return 'completed';
  return 'active';
}

export function groupExams(exams: Exam[]) {
  return {
    draft: exams.filter((e) => groupExam(e) === 'draft'),
    upcoming: exams.filter((e) => groupExam(e) === 'upcoming'),
    active: exams.filter((e) => groupExam(e) === 'active'),
    completed: exams.filter((e) => groupExam(e) === 'completed'),
  };
}