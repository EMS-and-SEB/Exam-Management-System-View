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

export function Header({ onOpenProfile }: { onOpenProfile: () => void }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const matches = useMatches();

  if (!user) return null;

  const activeNavItem = navConfig.find((item) => location.pathname.startsWith(item.path));
  const extraCrumbs = matches
    .map((m) => (m.handle as RouteHandle | undefined)?.crumb)
    .filter((c): c is string => Boolean(c));
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/dashboard" />}>
                {portalTitleByRole[user.role]}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {activeNavItem && (
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