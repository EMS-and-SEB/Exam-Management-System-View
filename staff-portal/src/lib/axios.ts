import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original?._retried && !original?.url?.includes('/auth/')) {
      original._retried = true;
      try {
        refreshPromise ??= axios
          .post(`${import.meta.env.VITE_API_URL}/auth/staff/refresh`, {}, { withCredentials: true })
          .then((res) => {
            const token = res.data.jwt;
            useAuthStore.getState().setAccessToken(token);
            return token;
          })
          .finally(() => { refreshPromise = null; });

        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch {
        useAuthStore.getState().clearSession();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    const backendMessage = error.response?.data?.error?.message;
    if (backendMessage) error.message = backendMessage;

    return Promise.reject(error);
  },
);