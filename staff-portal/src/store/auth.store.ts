import { create } from 'zustand';
import type { StaffRole } from '@/types/role';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  orgUnitId: string;
  orgUnit?: {
    id: string;
    name: string;
  };
}

interface StudentUser {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: 'STUDENT';
  userType: 'student';
  isActive: boolean;
}

type AuthUser = StaffUser | StudentUser;

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  updateUser: (user: Partial<StaffUser>) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  updateUser: (user) => set((state) => (
    state.user && state.user.role !== 'STUDENT' ? { user: { ...state.user, ...user } } : {}
  )),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () => set({ accessToken: null, user: null }),
}));
