import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck, LogOut } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { navConfig, portalTitleByRole } from '@/config/nav-config';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/modules/auth/hooks';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  if (!user) return null;

  const items = navConfig.filter((item) => item.roles.includes(user.role));
  const isCollapsed = state === 'collapsed';
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-1 py-1">
          <button
            onClick={isCollapsed ? toggleSidebar : undefined}
            className="group/logo relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <ShieldCheck className="h-4 w-4 transition-opacity group-hover/logo:opacity-0" />
            {isCollapsed && (
              <ChevronRight className="absolute h-4 w-4 opacity-0 transition-opacity group-hover/logo:opacity-100" />
            )}
          </button>

          <div className="flex flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold">EMS PORTAL</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Academic Integrity</span>
          </div>

          <button
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:hidden"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      render={<NavLink to={item.path} className="flex items-center gap-2" />}
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <item.icon className={cn('h-4 w-4', !isActive && item.color)} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {portalTitleByRole[user.role].replace(' Portal', '')}
            </span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => logout.mutate()}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}