import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode] = useState(() => {
    return import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false';
  });

  const loadUser = async () => {
    try {
      setLoading(true);
      const token = apiClient.getToken();
      if (!token) {
        setUser(null);
        setProfile(null);
        return;
      }

      const userData = await authService.getMe();
      if (userData) {
        setUser({ id: userData.id, email: userData.email, role: userData.role });
        setProfile(userData);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.warn('Sesión no encontrada o expirada:', err.message);
      setUser(null);
      setProfile(null);
      apiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for auth expired event
    const handleExpired = () => {
      setUser(null);
      setProfile(null);
    };
    window.addEventListener('finova_auth_expired', handleExpired);
    return () => window.removeEventListener('finova_auth_expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res?.user) {
      setUser({ id: res.user.id, email: res.user.email, role: res.user.role });
      setProfile(res.user);
    }
    return res;
  };

  const register = async (fullName, email, password, currency = 'USD') => {
    const res = await authService.register({ fullName, email, password, currency });
    if (res?.user) {
      setUser({ id: res.user.id, email: res.user.email, role: res.user.role });
      setProfile(res.user);
    }
    return res;
  };

  const logout = async () => {
    authService.logout();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    const updated = await authService.updateProfile(updates);
    setProfile(prev => ({ ...prev, ...updated }));
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  const resetPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  // 1-Click Demo Logins
  const loginAsDemoUser = async () => {
    try {
      return await login('jesus@finova.app', 'password123');
    } catch (err) {
      console.error('Error logging in as demo user:', err);
      throw err;
    }
  };

  const loginAsDemoAdmin = async () => {
    try {
      return await login('admin@finova.app', 'admin123');
    } catch (err) {
      console.error('Error logging in as demo admin:', err);
      throw err;
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isDemoMode,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
        loginAsDemoUser,
        loginAsDemoAdmin,
        reloadProfile: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
