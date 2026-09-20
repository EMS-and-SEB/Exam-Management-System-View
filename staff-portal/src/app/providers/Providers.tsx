import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner'
import { http } from '../../lib/axios';
import { useAuthStore } from '../../store/auth.store';
import { AppShellSkeleton } from '../../components/shared/AppSkeleton';
import { ThemeProvider } from './theme-provider';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
        try {
        const { data } = await http.post('/auth/staff/refresh');
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
  )
}