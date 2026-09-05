'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, UserRole, PendingAction } from '@/types/auth';
import { getStoredUsers, saveStoredUsers } from '@/lib/mockData';

interface AuthModalOptions {
  defaultTab: 'LOGIN' | 'SIGNUP';
  defaultRole: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isLoaded: boolean;
  login: (email: string, password: string, role: UserRole, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  isAuthModalOpen: boolean;
  authModalOptions: AuthModalOptions;
  openAuthModal: (options?: { defaultTab?: 'LOGIN' | 'SIGNUP'; defaultRole?: UserRole; pendingAction?: PendingAction }) => void;
  closeAuthModal: () => void;
  pendingAction: PendingAction;
  setPendingAction: (action: PendingAction) => void;
  clearPendingAction: () => void;
  executePendingAction: () => PendingAction;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'ds_streetwear_current_user';
const REMEMBER_KEY = 'ds_streetwear_remember_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalOptions, setAuthModalOptions] = useState<AuthModalOptions>({
    defaultTab: 'LOGIN',
    defaultRole: 'user'
  });
  const [pendingAction, setPendingActionState] = useState<PendingAction>(null);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        // 1. Try real backend session check via HttpOnly cookie
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user && isMounted) {
            const apiUser: AuthUser = {
              id: data.user.id || data.user._id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              status: 'active',
              createdAt: data.user.createdAt || new Date().toISOString()
            };
            setUser(apiUser);
            setIsLoaded(true);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend session check unavailable, falling back to local session:', err);
      }

      // 2. Fallback to local storage session if offline
      try {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          const users = getStoredUsers();
          const validUser = users.find((u) => u.id === parsed.id && u.status !== 'suspended');
          if (validUser) {
            const { passwordHash: _, ...safeUser } = validUser;
            setUser(safeUser);
          } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.removeItem(REMEMBER_KEY);
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Failed to restore auth session:', e);
        if (isMounted) setUser(null);
      }

      if (isMounted) setIsLoaded(true);
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthModal = useCallback(
    (options?: { defaultTab?: 'LOGIN' | 'SIGNUP'; defaultRole?: UserRole; pendingAction?: PendingAction }) => {
      setAuthModalOptions({
        defaultTab: options?.defaultTab || 'LOGIN',
        defaultRole: options?.defaultRole || 'user'
      });
      if (options?.pendingAction) {
        setPendingActionState(options.pendingAction);
      }
      setIsAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const setPendingAction = useCallback((action: PendingAction) => {
    setPendingActionState(action);
  }, []);

  const clearPendingAction = useCallback(() => {
    setPendingActionState(null);
  }, []);

  const executePendingAction = useCallback(() => {
    const action = pendingAction;
    setPendingActionState(null);
    return action;
  }, [pendingAction]);

  const login = async (
    email: string,
    password: string,
    requestedRole: UserRole,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try real backend API login
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.user) {
        if (requestedRole === 'admin' && data.user.role !== 'admin') {
          return { success: false, error: 'Security clearance denied: This account lacks administrative clearance.' };
        }

        const safeUser: AuthUser = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          status: 'active',
          createdAt: data.user.createdAt || new Date().toISOString()
        };

        setUser(safeUser);

        try {
          if (rememberMe) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
            localStorage.setItem(REMEMBER_KEY, 'true');
          } else {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
            localStorage.removeItem(REMEMBER_KEY);
          }
        } catch (e) {
          console.error('Failed to save session:', e);
        }

        setIsAuthModalOpen(false);
        return { success: true };
      } else if (res.status === 401 || res.status === 400) {
        // If the backend actively rejected with invalid credentials, check if it matches local mock user
        const users = getStoredUsers();
        const match = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (!match) {
          return { success: false, error: data.error || 'Invalid email or password.' };
        }
      }
    } catch (err) {
      console.warn('Backend login network error, falling back to local auth:', err);
    }

    // 2. Fallback to mock user authentication for demo credentials
    const users = getStoredUsers();
    const match = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!match) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (match.status === 'suspended') {
      return { success: false, error: 'This account has been suspended by administration.' };
    }

    if (match.passwordHash !== password) {
      return { success: false, error: 'Incorrect password entered.' };
    }

    if (requestedRole === 'admin' && match.role !== 'admin') {
      return { success: false, error: 'Security clearance denied: This account lacks administrative clearance.' };
    }

    const { passwordHash: _, ...safeUser } = match;
    setUser(safeUser);

    try {
      if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
        localStorage.setItem(REMEMBER_KEY, 'true');
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    setIsAuthModalOpen(false);
    return { success: true };
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();

    // 1. Try real backend signup
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          email: cleanEmail,
          password: data.password
        })
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok && resData.success && resData.user) {
        const safeUser: AuthUser = {
          id: resData.user.id || resData.user._id,
          name: resData.user.name,
          email: resData.user.email,
          role: resData.user.role,
          status: 'active',
          createdAt: resData.user.createdAt || new Date().toISOString()
        };

        setUser(safeUser);

        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
        } catch (e) {
          console.error('Failed to save signup session:', e);
        }

        setIsAuthModalOpen(false);
        return { success: true };
      } else if (resData.error) {
        return { success: false, error: resData.error };
      }
    } catch (err) {
      console.warn('Backend signup error, falling back to local:', err);
    }

    // 2. Fallback to mock user signup
    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: data.password,
      role: data.role,
      status: 'active' as const,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
      ordersCount: 0
    };

    saveStoredUsers([...users, newUser]);

    const { passwordHash: _, ...safeUser } = newUser;
    setUser(safeUser);

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    } catch (e) {
      console.error('Failed to save signup session:', e);
    }

    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Backend logout request failed:', err);
    }

    setUser(null);
    setPendingActionState(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminSession');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }

    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        router.push('/');
      }
    }
  }, [router]);

  const updateProfile = useCallback(
    (updates: Partial<AuthUser>) => {
      if (!user) return;
      const updated = { ...user, ...updates };
      setUser(updated);

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
        const users = getStoredUsers();
        const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, ...updates } : u));
        saveStoredUsers(updatedUsers);
      } catch (e) {
        console.error('Failed to update stored profile:', e);
      }
    },
    [user]
  );

  const role = user?.role || null;
  const isAuthenticated = Boolean(user);
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isUser,
        isLoaded,
        login,
        signup,
        logout,
        updateProfile,
        isAuthModalOpen,
        authModalOptions,
        openAuthModal,
        closeAuthModal,
        pendingAction,
        setPendingAction,
        clearPendingAction,
        executePendingAction
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
