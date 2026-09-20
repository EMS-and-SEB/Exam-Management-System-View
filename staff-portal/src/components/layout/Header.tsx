import { Link, useLocation, useMatches } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { navConfig, portalTitleByRole } from '@/config/nav-config';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/modules/auth/hooks';

interface RouteHandle { crumb?: string }

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
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
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" aria-label="Open account menu" />
            }
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/profile" />}>
              <UserIcon className="mr-2 h-4 w-4" />Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}