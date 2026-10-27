import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { getStorageService } from '../services/storage';
import { isFirebaseConfigured, getFirebaseAuth, getFirebaseFirestore } from '../services/firebase/client';

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
  authLoading: boolean;
  isFirebaseMode: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginAsDemoUser: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isVisualEditActive: boolean;
  setVisualEditActive: (active: boolean) => void;
  canEditContent: boolean;
  canManageRequests: boolean;
  canManageSettings: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hayaah_admin_auth_user';

export interface PerformLoginOptions {
  email: string;
  password: string;
  isFirebaseMode: boolean;
  isDemoAllowed: boolean;
  onFirebaseSignIn?: (email: string, password: string) => Promise<{ success: boolean; user?: AdminUser; error?: string }>;
  onDemoLogin?: (role: UserRole) => Promise<void>;
}

export async function performEmailLogin({
  email,
  password,
  isFirebaseMode,
  isDemoAllowed,
  onFirebaseSignIn,
  onDemoLogin,
}: PerformLoginOptions): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  // 1. Firebase mode
  if (isFirebaseMode) {
    if (onFirebaseSignIn) {
      return onFirebaseSignIn(email, password);
    }
    return { success: false, error: 'Firebase Auth handler missing' };
  }

  // 2. Demo adapter authentication (admin@hayaah.demo / demo1234 or receptionist@hayaah.demo / demo1234)
  const cleanEmail = email.trim().toLowerCase();

  if (isDemoAllowed && onDemoLogin) {
    if (
      (cleanEmail === 'admin@hayaah.demo' || cleanEmail === 'owner@hayaahclinic.com') &&
      password === 'demo1234'
    ) {
      try {
        await onDemoLogin('owner');
        return { success: true };
      } catch {
        return { success: false, error: 'بيانات الدخول غير صحيحة / Invalid credentials' };
      }
    }

    if (
      (cleanEmail === 'receptionist@hayaah.demo' || cleanEmail === 'receptionist@hayaahclinic.com') &&
      password === 'demo1234'
    ) {
      try {
        await onDemoLogin('receptionist');
        return { success: true };
      } catch {
        return { success: false, error: 'بيانات الدخول غير صحيحة / Invalid credentials' };
      }
    }
  }

  const defaultError = isDemoAllowed
    ? 'بيانات الدخول غير صحيحة. استخدم admin@hayaah.demo / demo1234 / Invalid credentials'
    : 'بيانات الدخول غير صحيحة / Invalid credentials';

  return {
    success: false,
    error: defaultError,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFirebaseMode = isFirebaseConfigured();

  const [user, setUser] = useState<AdminUser | null>(() => {
    // In Firebase mode, do NOT rely on localStorage; use Firebase Auth persistence
    if (isFirebaseMode) return null;
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isFirebaseMode);
  const [isVisualEditActive, setVisualEditActive] = useState<boolean>(true);

  // Sync to localStorage only in Demo Mode
  useEffect(() => {
    if (isFirebaseMode) return;
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user, isFirebaseMode]);

  // Subscribe to Firebase Auth state when Firebase mode is active
  useEffect(() => {
    if (!isFirebaseMode) {
      setAuthLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const auth = await getFirebaseAuth();
        const { onAuthStateChanged, signOut } = await import('firebase/auth');
        const db = await getFirebaseFirestore();
        const { doc, getDoc } = await import('firebase/firestore');

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!firebaseUser) {
            setUser(null);
            setAuthLoading(false);
            return;
          }

          // Fetch admin role strictly from Firestore collection `admins/{uid}`
          try {
            const adminDocRef = doc(db, 'admins', firebaseUser.uid);
            const snap = await getDoc(adminDocRef);

            if (snap.exists()) {
              const data = snap.data();
              const validRoles: UserRole[] = ['owner', 'receptionist', 'editor', 'viewer'];
              if (data?.role && validRoles.includes(data.role as UserRole)) {
                setUser({
                  id: firebaseUser.uid,
                  name: data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
                  role: data.role as UserRole,
                  email: firebaseUser.email || '',
                });
                setAuthError(null);
                setAuthLoading(false);

                // Auto-seed booking_settings/global if owner session and doc missing
                if (data.role === 'owner') {
                  (async () => {
                    try {
                      const settingsSnap = await getDoc(doc(db, 'booking_settings', 'global'));
                      if (!settingsSnap.exists()) {
                        const { DEFAULT_BOOKING_SETTINGS } = await import('../services/booking/slotEngine');
                        const { setDoc } = await import('firebase/firestore');
                        await setDoc(doc(db, 'booking_settings', 'global'), DEFAULT_BOOKING_SETTINGS);
                      }
                    } catch (e) {
                      console.warn('[AuthContext] Auto-seed booking_settings/global skipped:', e);
                    }
                  })();
                }
                return;
              }
            }

            // If user has no admins doc or invalid role, DENY access immediately
            await signOut(auth);
            setUser(null);
            setAuthError(
              'عفواً، تم رفض الوصول: حسابك لا يمتلك صلاحية مسجلة في admins/{uid}. يرجى مراجعة مسؤول النظام / Access denied: No admin role found in admins/{uid}.'
            );
          } catch (err: any) {
            console.error('Error verifying admin document in admins/{uid}:', err);
            await signOut(auth);
            setUser(null);
            setAuthError('حدث خطأ أثناء التحقق من صلاحيات الحساب / Error verifying permissions');
          } finally {
            setAuthLoading(false);
          }
        });
      } catch (err) {
        console.warn('Firebase Auth initialization skipped or failed:', err);
        setAuthLoading(false);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isFirebaseMode]);

  const clearAuthError = () => {
    setAuthError(null);
  };

  const loginAsDemoUser = async (role: UserRole) => {
    const isDemoAllowed = !isFirebaseMode && (import.meta.env.VITE_ADMIN_DEMO_LOGIN !== 'false');
    if (!isDemoAllowed) {
      throw new Error(
        'الدخول التجريبي معطل في هذا الوضع. يرجى تسجيل الدخول بحساب رسمي. / Demo login is disabled in this environment.'
      );
    }

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
    setAuthError(null);

    const isDemoAllowed = !isFirebaseMode && (import.meta.env.VITE_ADMIN_DEMO_LOGIN !== 'false');

    const result = await performEmailLogin({
      email,
      password,
      isFirebaseMode,
      isDemoAllowed,
      onFirebaseSignIn: async (e, p) => {
        try {
          const auth = await getFirebaseAuth();
          const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');
          const db = await getFirebaseFirestore();
          const { doc, getDoc } = await import('firebase/firestore');

          const cred = await signInWithEmailAndPassword(auth, e.trim(), p);
          const uid = cred.user.uid;

          // Check role in `admins/{uid}`
          const adminDoc = await getDoc(doc(db, 'admins', uid));
          if (!adminDoc.exists()) {
            await signOut(auth);
            setUser(null);
            const errorMsg =
              'تم التحقق من بيانات الدخول، لكن الحساب غير مسجل في وثائق المشرفين (admins/{uid}). يرجى مراجعة المالك / User authenticated, but no admin doc found in admins/{uid}. Access denied.';
            return { success: false, error: errorMsg };
          }

          const data = adminDoc.data();
          const validRoles: UserRole[] = ['owner', 'receptionist', 'editor', 'viewer'];
          if (!data?.role || !validRoles.includes(data.role as UserRole)) {
            await signOut(auth);
            setUser(null);
            const errorMsg =
              'الدور المحدد للحساب غير صالح في admins/{uid} / Invalid admin role in admins/{uid}.';
            return { success: false, error: errorMsg };
          }

          const loggedInUser: AdminUser = {
            id: uid,
            name: data.name || cred.user.displayName || cred.user.email?.split('@')[0] || 'Admin',
            role: data.role as UserRole,
            email: cred.user.email || e,
          };

          if (data.role === 'owner') {
            try {
              const settingsSnap = await getDoc(doc(db, 'booking_settings', 'global'));
              if (!settingsSnap.exists()) {
                const { DEFAULT_BOOKING_SETTINGS } = await import('../services/booking/slotEngine');
                const { setDoc } = await import('firebase/firestore');
                await setDoc(doc(db, 'booking_settings', 'global'), DEFAULT_BOOKING_SETTINGS);
              }
            } catch (eAuto) {
              console.warn('[AuthContext] Auto-seed booking_settings/global skipped:', eAuto);
            }
          }

          setUser(loggedInUser);
          return { success: true, user: loggedInUser };
        } catch (err: any) {
          let message = err.message || 'بيانات الدخول غير صحيحة / Invalid credentials';
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة / Invalid email or password';
          }
          return { success: false, error: message };
        }
      },
      onDemoLogin: async (roleToLogin) => {
        await loginAsDemoUser(roleToLogin);
      },
    });

    if (!result.success && result.error) {
      setAuthError(result.error);
    }

    return result;
  };

  const logout = async () => {
    if (isFirebaseMode) {
      try {
        const auth = await getFirebaseAuth();
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase logout error:', err);
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    if (user) {
      const storage = getStorageService();
      await storage.logActivity(user.role, user.name, 'User Logout', 'User logged out');
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
        authLoading,
        isFirebaseMode,
        authError,
        clearAuthError,
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
