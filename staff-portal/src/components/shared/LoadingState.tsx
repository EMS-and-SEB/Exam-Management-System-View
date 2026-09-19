import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mb-2" />
      <p className="text-sm">{label}</p>
    </div>
  );
}