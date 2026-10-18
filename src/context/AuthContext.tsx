import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { getStorageService } from '../services/storage';

export interface AdminUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: AdminUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginAsDemoUser: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isVisualEditActive: boolean;
  setVisualEditActive: (active: boolean) => void;
  canEditContent: boolean;
  canManageRequests: boolean;
  canManageSettings: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hayaah_admin_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isVisualEditActive, setVisualEditActive] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const loginAsDemoUser = async (role: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      owner: 'د. مالك العيادة (Owner)',
      editor: 'مسؤول المحتوى (Content Editor)',
      receptionist: 'موظف الاستقبال (Receptionist)',
      viewer: 'زائر تجريبي (Demo Viewer)',
    };

    const newUser: AdminUser = {
      id: `usr_${role}_${Date.now()}`,
      name: roleLabels[role],
      role,
      email: `${role}@hayaahclinic.com`,
    };

    setUser(newUser);
    const storage = getStorageService();
    await storage.logActivity(role, newUser.name, 'User Login', `Logged in as ${role}`);
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // 1. Supabase Auth if credentials exist in .env
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const newUser: AdminUser = {
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'Admin',
            role: 'owner',
            email: data.user.email || email,
          };
          setUser(newUser);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase auth failed, trying demo check:', err);
      }
    }

    // 2. Demo adapter authentication (admin@hayaah.demo / demo1234 or receptionist@hayaah.demo / demo1234)
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@hayaah.demo' || cleanEmail === 'owner@hayaahclinic.com') &&
      password === 'demo1234'
    ) {
      await loginAsDemoUser('owner');
      return { success: true };
    }

    if (
      (cleanEmail === 'receptionist@hayaah.demo' || cleanEmail === 'receptionist@hayaahclinic.com') &&
      password === 'demo1234'
    ) {
      await loginAsDemoUser('receptionist');
      return { success: true };
    }

    return {
      success: false,
      error: 'بيانات الدخول غير صحيحة. استخدم admin@hayaah.demo / demo1234 / Invalid credentials',
    };
  };

  const logout = () => {
    if (user) {
      const storage = getStorageService();
      storage.logActivity(user.role, user.name, 'User Logout', 'User logged out');
    }
    setUser(null);
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user);
  const canEditContent = role === 'owner' || role === 'editor';
  const canManageRequests = role === 'owner' || role === 'receptionist';
  const canManageSettings = role === 'owner';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loginAsDemoUser,
        loginWithEmail,
        logout,
        isVisualEditActive,
        setVisualEditActive,
        canEditContent,
        canManageRequests,
        canManageSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
