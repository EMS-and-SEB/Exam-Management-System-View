import { useEffect, useRef, useState } from 'react';
import { QueryCache, MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { http } from '../../lib/axios';
import { useAuthStore } from '../../store/auth.store';
import { AppShellSkeleton } from '../../components/shared/AppSkeleton';
import { ThemeProvider } from './theme-provider';

interface BackendErrorDetail {
  field?: string;
  message?: string;
}

function getRequestErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Something went wrong. Please try again.';

  const response = (error as Error & {
    response?: { data?: { error?: { code?: string; details?: BackendErrorDetail[] } } };
  }).response;
  const apiError = response?.data?.error;
  const detail = apiError?.details?.[0];
  const field = detail?.field ?? '';

  if (/uuid is expected/i.test(error.message)) {
    return 'Your profile could not be updated. Please try again.';
  }

  if (apiError?.code === 'VALIDATION_ERROR' && detail) {
    if (field.includes('correctAnswer')) return 'Please select a valid correct answer.';
    if (field.includes('options')) return 'Please check the answer options and try again.';
    if (field.includes('prompt')) return 'Please enter a question prompt.';
    if (field.includes('points')) return 'Points must be a positive whole number.';
    if (field.includes('type')) return 'Please select a question type.';
    if (detail.message && !/^Expected .+, received .+$/.test(detail.message)) return detail.message;
    return 'Some of the entered values are invalid. Please review the form.';
  }

  return error.message || 'Something went wrong. Please try again.';
}

const showRequestError = (error: unknown) => {
  toast.error(getRequestErrorMessage(error));
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: showRequestError }),
  mutationCache: new MutationCache({ onError: showRequestError }),
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    async function bootstrap() {
      try {
        const { data } = await http.post('/auth/staff/refresh');
        useAuthStore.getState().setAccessToken(data.jwt);
        const me = await http.get('/auth/me').then((r) => r.data);
        useAuthStore.getState().setSession(data.jwt, me);
      } catch {
        useAuthStore.getState().clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    }
    bootstrap();
  }, []);

  if (isBootstrapping) {
    return <AppShellSkeleton />;
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}