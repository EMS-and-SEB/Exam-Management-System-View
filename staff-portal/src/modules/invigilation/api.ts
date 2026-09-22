import { http } from '@/lib/axios';
import type { Exam } from '@/modules/exam/api';

export interface RosterEntry {
  id: string;
  studentId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'FORCE_SUBMITTED' | 'EXPIRED';
  startedAt: string | null;
  endsAt: string | null;
  submittedAt: string | null;
  student: { studentId: string; name: string };
  incidents: { id: string; category: string }[];
}

interface OtpResponse {
  otp: string;
  expiresAt: string;
}

export const invigilationApi = {
  listAssigned: () => http.get<Exam[]>('/exams').then((r) => r.data),
  getExam: (id: string) => http.get<Exam>(`/exams/${id}`).then((r) => r.data),
  getOtp: (id: string) => http.get<OtpResponse>(`/exams/${id}/otp`).then((r) => r.data),
  getRoster: (id: string) => http.get<RosterEntry[]>(`/exams/${id}/roster`).then((r) => r.data),
};