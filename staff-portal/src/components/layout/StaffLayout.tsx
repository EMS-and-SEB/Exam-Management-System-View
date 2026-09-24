import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { Header } from './Header';
import { ProfileDrawer } from '@/modules/staff/ProfileDrawer';
import { useState } from 'react';

export function StaffLayout({ children }: { children?: React.ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header onOpenProfile={() => setProfileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children ?? <Outlet />}
        </main>
      </SidebarInset>
      {profileOpen && <ProfileDrawer open onOpenChange={setProfileOpen} />}
    </SidebarProvider>
  );
}