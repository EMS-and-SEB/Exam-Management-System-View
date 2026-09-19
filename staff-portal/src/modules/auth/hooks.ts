import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from './api';
import { useAuthStore } from '../../store/auth.store';
import { toast } from 'sonner'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setSession(data.jwt, data.staff);
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      toast.success('Logged out successfully.');
      navigate('/login');
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: (email: string) => authApi.requestPasswordReset(email) });
}

export function useVerifyPasswordReset() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authApi.verifyPasswordReset(email, code),
  });
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: ({ resetToken, newPassword }: { resetToken: string; newPassword: string }) =>
      authApi.confirmPasswordReset(resetToken, newPassword),
  });
}