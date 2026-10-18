import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, BookOpen, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/Header';
import { StudentProfileDrawer } from '@/modules/portal/StudentProfileDrawer';
import { useAuthStore } from '@/store/auth.store';

const studentNavItems = [
  { title: 'My Courses', url: '/student/courses', icon: BookOpen },
  { title: 'Upcoming Exams', url: '/student/exams', icon: Calendar },
  { title: 'My Results', url: '/student/results', icon: Award },
];

export function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = useAuthStore.getState() as any;
    if (typeof store.logout === 'function') store.logout();
    else if (typeof store.clearUser === 'function') store.clearUser();
    else if (typeof store.reset === 'function') store.reset();
    
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <div className="px-4 py-6">
                <h2 className="text-lg font-semibold tracking-tight">EMS PORTAL</h2>
                <p className="text-xs text-muted-foreground">Academic Integrity</p>
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {studentNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        isActive={location.pathname === item.url}
                        onClick={() => navigate(item.url)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto p-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <Header onOpenProfile={() => setIsProfileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      {user && <StudentProfileDrawer user={user} open={isProfileOpen} onOpenChange={setIsProfileOpen} />}
    </SidebarProvider>
  );
}