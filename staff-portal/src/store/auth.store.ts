import { create } from 'zustand';
import type { StaffRole } from '@/types/role';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

interface AuthState {
  accessToken: string | null;
  user: StaffUser | null;
  setSession: (accessToken: string, user: StaffUser) => void;
  updateUser: (user: Partial<StaffUser>) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  updateUser: (user) => set((state) => ({ user: state.user ? { ...state.user, ...user } : null })),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () => set({ accessToken: null, user: null }),
}));