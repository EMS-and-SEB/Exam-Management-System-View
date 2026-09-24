import { Outlet } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/modules/auth/hooks';

export function InvigilatorLayout({ children }: { children?: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  if (!user) return null;
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold">EMS</span>
          <span className="text-xs text-muted-foreground border-l pl-2 ml-1">Invigilator Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-right leading-tight">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">Invigilator</p>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {children ?? <Outlet />}
      </main>

      <footer className="border-t px-6 py-3 text-xs text-muted-foreground text-center shrink-0">
        Institutional Exam Management System (EMS) · Academic Integrity Protocol
      </footer>
    </div>
  );
}