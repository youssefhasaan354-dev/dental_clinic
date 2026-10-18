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
