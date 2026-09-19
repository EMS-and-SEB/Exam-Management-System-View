import { Sheet, SheetContent } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DrawerShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerLeft?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

const WIDTH_CLASSES = { md: 'sm:max-w-md', lg: 'sm:max-w-lg', xl: 'sm:max-w-2xl' };

export function DrawerShell({
  open, onOpenChange, icon, title, subtitle, badge, children, footer, footerLeft, width = 'md',
}: DrawerShellProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn('flex flex-col p-0 gap-0', WIDTH_CLASSES[width])}>
        <div className="flex items-start justify-between gap-3 border-b px-6 py-4">
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold truncate">{title}</h2>
                {badge}
              </div>
              {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {(footer || footerLeft) && (
          <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">{footerLeft}</div>
            <div className="flex gap-2">{footer}</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}