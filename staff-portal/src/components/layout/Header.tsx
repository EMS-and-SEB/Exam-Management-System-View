// src/components/layout/Header.tsx
import { Link, useLocation, useMatches } from 'react-router-dom';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { navConfig, portalTitleByRole } from '@/config/nav-config';
import { useAuthStore } from '@/store/auth.store';

interface RouteHandle { crumb?: string }

interface HeaderProps {
  onOpenProfile: () => void;
  user?: { name: string; email?: string; role?: string };
}

export function Header({ onOpenProfile, user: overrideUser }: HeaderProps) {
  const staffUser = useAuthStore((s) => s.user);
  
  // Use the passed student user, otherwise fallback to staff user
  const user = overrideUser || staffUser;

  const location = useLocation();
  const matches = useMatches();

  // Don't return null - always render the header with at least the button
  const activeNavItem = navConfig.find((item) => location.pathname.startsWith(item.path));
  const extraCrumbs = matches
    .map((m) => (m.handle as RouteHandle | undefined)?.crumb)
    .filter((c): c is string => Boolean(c));
    
  // Calculate initials - default to "ST" if no user
  const initials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
    : 'ST';

  // Safely get portal title
  const portalTitle = user?.role 
    ? portalTitleByRole[user.role as keyof typeof portalTitleByRole] || "Portal"
    : "EMS PORTAL";

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to={overrideUser ? "/student/courses" : "/dashboard"} />}>
                {portalTitle}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {activeNavItem && !overrideUser && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {extraCrumbs.length > 0 ? (
                    <BreadcrumbLink render={<Link to={activeNavItem.path} />}>
                      {activeNavItem.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{activeNavItem.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}
            {extraCrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{crumb}</BreadcrumbPage></BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          aria-label="Open profile"
          title="Open profile"
          onClick={onOpenProfile}
          className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}