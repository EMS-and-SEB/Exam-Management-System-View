import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_MAP: Record<string, StatusVariant> = {
  // exam / course / cohort lifecycle
  DRAFT: 'neutral', ACTIVE: 'success', RELEASED: 'info', CLOSED: 'neutral', ARCHIVED: 'neutral',
  // session / exam-taking
  NOT_STARTED: 'neutral', IN_PROGRESS: 'info', SUBMITTED: 'success',
  FORCE_SUBMITTED: 'warning', EXPIRED: 'warning', DISCONNECTED: 'danger',
  // staff / student account state
  INACTIVE: 'neutral',
  // grading
  NEEDS_GRADING: 'warning', GRADED: 'success', AUTO_GRADED: 'success',
  // incidents
  INCIDENT: 'danger',
};

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900',
  warning: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900',
  danger: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900',
  info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900',
  neutral: 'bg-muted text-muted-foreground border-border',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant = STATUS_MAP[status] ?? 'neutral';
  const display = label ?? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge variant="outline" className={cn('font-medium', VARIANT_CLASSES[variant], className)}>
      {display}
    </Badge>
  );
}