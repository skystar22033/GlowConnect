import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

const TOKEN_KEY = 'glowconnect_token';
const USER_KEY = 'glowconnect_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On first load, verify any stored token is still valid and refresh user data
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        const freshUser = res.data.data.user;
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (userData, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: userData, token } = res.data.data;
    persistSession(userData, token);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    const { user: userData, token } = res.data.data;
    persistSession(userData, token);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateLocalUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateLocalUser }}
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
