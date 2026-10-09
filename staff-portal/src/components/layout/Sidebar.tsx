import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck, LogOut } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { getNavItems } from '@/config/nav-config';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/modules/auth/hooks';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  if (!user) return null;

  const items = getNavItems(user.role);
  const isCollapsed = state === 'collapsed';
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className=" h-12 border-b">
        <div className="flex h-8 items-center gap-2 px-1 py-1">
          <button
            onClick={isCollapsed ? toggleSidebar : undefined}
            className="group/logo relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
                        <ShieldCheck className="h-4 w-4 text-green-500 transition-opacity group-hover/logo:opacity-0" />
            {isCollapsed && (
              <ChevronRight className="absolute h-4 w-4 opacity-0 transition-opacity group-hover/logo:opacity-100" />
            )}
          </button>

          <div className={cn(" min-w-0 flex flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden overflow-hidden transition-[opacity] duration-100",
            isCollapsed ? "opacity-0" : "opacity-100 delay-150"
          )}>
            <span className=" whitespace-nowrap text-sm font-bold">EMS PORTAL</span>
            <span className=" whitespace-nowrap text-[10px] uppercase tracking-wide text-muted-foreground">Academic Integrity</span>
          </div>

          <button
            onClick={toggleSidebar}
            className="translate-y-0 text-muted-foreground hover:text-foreground active:translate-y-0 group-data-[collapsible=icon]:hidden"
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