// src/api/portalClient.ts
import axios from 'axios';

export const portalClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // Required for httpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

// 1. Attach Access Token to every request
portalClient.interceptors.request.use((config) => {
  if (currentAccessToken && config.headers) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// 2. Automatically refresh token on 401 Unauthorized
portalClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${portalClient.defaults.baseURL}/portal/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.jwt);
        originalRequest.headers.Authorization = `Bearer ${data.jwt}`;
        return portalClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        // Assuming your login route will be /student/login
        window.location.href = '/student/login'; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);