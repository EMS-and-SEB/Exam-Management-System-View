import axios from "axios";
import { useSessionStore } from "../store/session.store";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const sessionToken = useSessionStore.getState().session?.sessionToken;
  if (sessionToken) config.headers.Authorization = `Bearer ${sessionToken}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error.response?.data?.error?.message;
    if (backendMessage) error.message = backendMessage;
    return Promise.reject(error);
  },
);