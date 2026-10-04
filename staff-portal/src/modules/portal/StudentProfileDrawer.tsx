// src/modules/portal/StudentProfileDrawer.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Mail, Hash, GraduationCap } from 'lucide-react';
import { setAccessToken } from '@/api/portalClient'; // <-- ADDED THIS IMPORT

interface StudentUser {
  id: string;
  studentId: string;
  name: string;
  email: string;
}

interface StudentProfileDrawerProps {
  student: StudentUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfileDrawer({ student, open, onOpenChange }: StudentProfileDrawerProps) {
  const initials = student.name
    ? student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

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
            <h3 className="text-lg font-semibold">{student.name}</h3>
            <p className="text-sm text-muted-foreground">{student.studentId}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 rounded-md border p-3">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Student ID</p>
              <p className="text-sm font-medium">{student.studentId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border p-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border p-3">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium">Active Student</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="destructive" className="w-full" onClick={() => {
            onOpenChange(false);
            setTimeout(() => {
              setAccessToken(null);
              localStorage.removeItem('student-session');
              window.location.href = '/student/login';
            }, 100);
          }}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}