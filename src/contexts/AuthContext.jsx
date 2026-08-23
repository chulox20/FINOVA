import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, localStore, initLocalStore } from '../lib/supabase';
import { INITIAL_USER, INITIAL_ADMIN } from '../lib/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    initLocalStore();

    if (isSupabaseConfigured && supabase) {
      // 1. Check existing Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          // Check if local demo session is active
          const savedDemoUser = localStore.get(localStore.keys.USER, INITIAL_USER);
          setUser(savedDemoUser);
          setProfile(savedDemoUser);
          setIsDemoMode(true);
          setLoading(false);
        }
      });

      // 2. Auth State Change Listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsDemoMode(false);
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Default to Local Demo User
      const demoUser = localStore.get(localStore.keys.USER, INITIAL_USER);
      setUser(demoUser);
      setProfile(demoUser);
      setIsDemoMode(true);
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setProfile(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
    return null;
  };

  // Sign in with Email & Password
  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      await fetchProfile(data.user.id);
      setIsDemoMode(false);
      return data;
    }

    // Demo Mode Sign In
    if (email === INITIAL_ADMIN.email) {
      loginAsDemoAdmin();
    } else {
      loginAsDemoUser();
    }
    return { user };
  };

  // Sign up with Email & Password
  const register = async (name, email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });
      if (error) throw error;
      return data;
    }

    // Demo Mode Sign Up
    const newUser = {
      ...INITIAL_USER,
      id: `usr-${Date.now()}`,
      full_name: name,
      email,
      role: 'user',
    };
    localStore.set(localStore.keys.USER, newUser);
    setUser(newUser);
    setProfile(newUser);
    setIsDemoMode(true);
    return { user: newUser };
  };

  // Google OAuth
  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      return data;
    }

    loginAsDemoUser();
  };

  // Reset Password
  const resetPassword = async (email) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      return data;
    }
    return true;
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (isSupabaseConfigured && supabase && !isDemoMode && user) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    }

    // Demo mode profile update
    const updated = { ...profile, ...updates };
    localStore.set(localStore.keys.USER, updated);
    setUser(updated);
    setProfile(updated);
    return updated;
  };

  // Sign Out
  const logout = async () => {
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  // Switch to Demo User (Jesús Figueroa)
  const loginAsDemoUser = () => {
    localStore.set(localStore.keys.USER, INITIAL_USER);
    setUser(INITIAL_USER);
    setProfile(INITIAL_USER);
    setIsDemoMode(true);
  };

  // Switch to Demo Admin
  const loginAsDemoAdmin = () => {
    localStore.set(localStore.keys.USER, INITIAL_ADMIN);
    setUser(INITIAL_ADMIN);
    setProfile(INITIAL_ADMIN);
    setIsDemoMode(true);
  };

  const isAdmin = profile?.role === 'admin';

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
        loginWithGoogle,
        resetPassword,
        updateProfile,
        logout,
        loginAsDemoUser,
        loginAsDemoAdmin,
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
