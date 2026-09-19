import { http } from '../../lib/axios';

export const authApi = {
  login: (email: string, password: string) =>
    http.post('/auth/staff/login', { email, password }).then((r) => r.data),
  logout: () => http.post('/auth/staff/logout'),
  me: () => http.get('/auth/me').then((r) => r.data),
  requestPasswordReset: (email: string) =>
    http.post('/auth/staff/password-reset/request', { email }),
  verifyPasswordReset: (email: string, code: string) =>
    http.post('/auth/staff/password-reset/verify', { email, code }).then((r) => r.data),
  confirmPasswordReset: (resetToken: string, newPassword: string) =>
    http.post('/auth/staff/password-reset/confirm', { resetToken, newPassword }),
};