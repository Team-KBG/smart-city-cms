import axios from 'axios';
import { getToken, clearToken } from '../utils/auth';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// URLs that are allowed to return 401 without triggering global logout
const AUTH_SKIP_URLS = ['/api/auth/me', '/api/auth/login', '/api/auth/register', '/api/auth/logout'];

// Handle 401 globally — clear token except on auth routes themselves
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const isAuthRoute = AUTH_SKIP_URLS.some((skip) => url.includes(skip));
      if (!isAuthRoute) {
        clearToken();
        // Redirect to login only if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default API;
