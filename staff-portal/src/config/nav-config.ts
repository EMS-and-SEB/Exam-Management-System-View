import {
  LayoutGrid, Users, ClipboardList, BookOpen, Eye, ClipboardCheck,
  BarChart3, UserCog, ScrollText, ShieldCheck, type LucideIcon, UserCheck,
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
  { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid, color: 'text-primary', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR', 'SUPER_ADMIN', 'UNIT_ADMIN'] },
  { label: 'Staff', path: '/staff', icon: UserCog, color: 'text-primary', roles: ['SUPER_ADMIN', 'UNIT_ADMIN'] },
  { label: 'Students', path: '/students', icon: UserCog, color: 'text-primary', roles: ['SUPER_ADMIN', 'UNIT_ADMIN'] },
  { label: 'Courses', path: '/courses', icon: Users, color: 'text-primary', roles: ['INSTRUCTOR', 'SUPER_ADMIN', 'UNIT_ADMIN'] },
  { label: 'Cohorts', path: '/cohorts', icon: Users, color: 'text-primary', roles: ['EXIT_EXAM_COORDINATOR', 'SUPER_ADMIN', 'UNIT_ADMIN'] },
  { label: 'Invigilator Assignment', path: '/invigilator-assignment', icon: UserCheck, color: 'text-primary', roles: ['UNIT_ADMIN'] },
  { label: 'Exams & Assessments', path: '/exams', icon: ClipboardList, color: 'text-primary', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Question Bank', path: '/questions', icon: BookOpen, color: 'text-primary', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Invigilation', path: '/invigilation', icon: Eye, color: 'text-primary', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR', 'INVIGILATOR'] },
  { label: 'Grading', path: '/grading', icon: ClipboardCheck, color: 'text-primary', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Results', path: '/results', icon: BarChart3, color: 'text-primary', roles: ['INSTRUCTOR', 'EXIT_EXAM_COORDINATOR'] },
  { label: 'Audit Log', path: '/audit', icon: ScrollText, color: 'text-primary', roles: ['SUPER_ADMIN'] },
  { label: 'Retention Policy', path: '/retention-policy', icon: ShieldCheck, color: 'text-primary', roles: ['SUPER_ADMIN'] },
];

const unitAdminNavOrder = ['/dashboard', '/courses', '/cohorts', '/invigilator-assignment', '/staff', '/students'];

export function getNavItems(role: StaffRole): NavItem[] {
  const items = navConfig.filter((item) => item.roles.includes(role));
  if (role !== 'UNIT_ADMIN') return items;

  const order = new Map(unitAdminNavOrder.map((path, index) => [path, index]));
  return items.toSorted((a, b) => (order.get(a.path) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.path) ?? Number.MAX_SAFE_INTEGER));
}

export const portalTitleByRole: Record<StaffRole, string> = {
  INSTRUCTOR: 'Instructor Portal',
  EXIT_EXAM_COORDINATOR: 'Exam Coordination Portal',
  INVIGILATOR: 'Invigilation Portal',
  SUPER_ADMIN: 'Exam Administration Portal',
  UNIT_ADMIN: 'Unit Administration Portal',
};
