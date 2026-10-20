import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_MAP: Record<string, StatusVariant> = {
  DRAFT: 'neutral', ACTIVE: 'success', RELEASED: 'info', CLOSED: 'neutral', ARCHIVED: 'neutral',
  NOT_STARTED: 'neutral', IN_PROGRESS: 'info', SUBMITTED: 'success',
  FORCE_SUBMITTED: 'warning', EXPIRED: 'warning', DISCONNECTED: 'danger',
  INACTIVE: 'neutral',
  NEEDS_GRADING: 'warning', GRADED: 'success', AUTO_GRADED: 'success',
  INCIDENT: 'danger',
};

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30',
  warning: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30',
  danger: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30',
  info: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30',
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
