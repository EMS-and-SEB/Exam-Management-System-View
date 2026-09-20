import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  badge?: string;
  subtitle?: string;
  backTo?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, badge, subtitle, backTo, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-start justify-between gap-4 pb-6">
      <div className="space-y-1">
        {backTo && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 text-muted-foreground"
            onClick={() => navigate(backTo)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {badge && (
            <Badge variant="secondary" className="font-medium">
              {badge}
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}