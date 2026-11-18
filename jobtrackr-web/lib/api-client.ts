import axios from 'axios';
import { API_URL, ROUTES } from './constants';
import { clearToken, getToken } from './auth';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Expired or invalid token: drop it and send the user to log in again.
    const isAuthCall = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthCall && typeof window !== 'undefined') {
      clearToken();
      window.location.href = `${ROUTES.login}?next=${encodeURIComponent(window.location.pathname)}`;
    }
    return Promise.reject(error);
  }
);
