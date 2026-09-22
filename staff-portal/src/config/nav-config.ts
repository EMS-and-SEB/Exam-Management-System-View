import {
  LayoutGrid, Users, ClipboardList, BookOpen, Eye, ClipboardCheck,
  BarChart3, UserCog, ScrollText, ShieldCheck, type LucideIcon,
} from 'lucide-react';
import type { StaffRole } from '@/types/role';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  color: string;
  roles: StaffRole[];
}

export const navConfig: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid, color: 'text-blue-500', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR', 'EXAM_ADMIN'] },
  { label: 'Courses', path: '/courses', icon: Users, color: 'text-emerald-500', roles: ['INSTRUCTOR', 'EXAM_ADMIN'] },
  { label: 'Cohorts', path: '/cohorts', icon: Users, color: 'text-emerald-500', roles: ['EXIT_EXAM_COORDINATOR', 'EXAM_ADMIN'] },
  { label: 'Students', path: '/students', icon: UserCog, color: 'text-cyan-500', roles: ['EXAM_ADMIN'] },
  { label: 'Exams & Assessments', path: '/exams', icon: ClipboardList, color: 'text-blue-500', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Question Bank', path: '/questions', icon: BookOpen, color: 'text-amber-500', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Invigilation', path: '/invigilation', icon: Eye, color: 'text-violet-500', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Grading', path: '/grading', icon: ClipboardCheck, color: 'text-teal-500', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Results', path: '/results', icon: BarChart3, color: 'text-rose-500', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Staff', path: '/staff', icon: UserCog, color: 'text-indigo-500', roles: ['EXAM_ADMIN'] },
  { label: 'Audit Log', path: '/audit', icon: ScrollText, color: 'text-slate-500', roles: ['EXAM_ADMIN'] },
  { label: 'Retention Policy', path: '/retention-policy', icon: ShieldCheck, color: 'text-slate-500', roles: ['EXAM_ADMIN'] },
];

export const portalTitleByRole: Record<StaffRole, string> = {
  EXAM_ADMIN: 'Admin Portal',
  INSTRUCTOR: 'Instructor Portal',
  EXIT_EXAM_COORDINATOR: 'Coordinator Portal',
  INVIGILATOR: 'Invigilator Portal',
};