import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, getUser, setToken, setUser, clearToken } from '../utils/auth';
import API from '../api/axios';

const AuthContext = createContext(null);

/**
 * Normalize any user object to always have both `id` and `_id` set.
 * Backend /me, /login, /register all return serializeUser() shape,
 * but guard here just in case.
 */
function normalizeUser(userData) {
  if (!userData) return null;
  const id = userData.id || userData._id || '';
  return { ...userData, id: id.toString(), _id: id.toString() };
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => normalizeUser(getUser()));
  const [loading, setLoading] = useState(true);

  // On mount: verify token with backend, refresh user data from DB
  useEffect(() => {
    const token = getToken();
    if (token) {
      API.get('/api/auth/me')
        .then(({ data }) => {
          const normalized = normalizeUser(data.data);
          setUserState(normalized);
          setUser(normalized);
        })
        .catch(() => {
          // Token invalid/expired — clear everything
          clearToken();
          setUserState(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token, userData) => {
    const normalized = normalizeUser(userData);
    setToken(token);
    setUser(normalized);
    setUserState(normalized);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Inform server of logout (for audit logging)
      await API.post('/api/auth/logout');
    } catch {
      // Ignore network errors — always clear local state
    } finally {
      clearToken();
      setUserState(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDeptStaff: user?.role === 'department_staff',
        isCitizen: user?.role === 'citizen',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
