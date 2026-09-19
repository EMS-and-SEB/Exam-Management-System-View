import { Skeleton } from '@/components/ui/skeleton';

export function AppShellSkeleton() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/20 p-4 space-y-3">
        <Skeleton className="h-8 w-32 mb-6" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-6">
          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
        </header>
        <main className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    </div>
  );
}