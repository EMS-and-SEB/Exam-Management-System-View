import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Mail, Hash, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface UserProfile {
  name: string;
  email?: string;
  studentId?: string;
  role?: string;
}

interface StudentProfileDrawerProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfileDrawer({ user, open, onOpenChange }: StudentProfileDrawerProps) {
  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  const handleLogout = () => {
    onOpenChange(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = useAuthStore.getState() as any;
    if (typeof store.logout === 'function') store.logout();
    else if (typeof store.clearUser === 'function') store.clearUser();
    else if (typeof store.reset === 'function') store.reset();
    window.location.href = '/login';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-75 sm:w-100">
        <SheetHeader>
          <SheetTitle>Student Profile</SheetTitle>
          <SheetDescription>Your account details</SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.studentId || user.email || 'Student'}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {user.studentId && (
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Student ID</p>
                <p className="text-sm font-medium">{user.studentId}</p>
              </div>
            </div>
          )}
          {user.email && (
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 rounded-md border p-3">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium">Active Student</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}