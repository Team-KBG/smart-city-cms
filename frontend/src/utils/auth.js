const TOKEN_KEY = 'scms_token';
const USER_KEY = 'scms_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated() {
  return !!getToken();
}

export function isAdmin() {
  const user = getUser();
  return user?.role === 'admin';
}

export function isDeptStaff() {
  const user = getUser();
  return user?.role === 'department_staff';
}

// In dev: VITE_API_URL is '' so Vite's proxy forwards /uploads to http://localhost:5000
// In production: set VITE_API_URL=https://your-backend.com in frontend/.env
export const BACKEND_URL = import.meta.env.VITE_API_URL || '';

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${BACKEND_URL}${imageUrl}`;
}
