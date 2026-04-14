'use client';

import React, { useEffect } from 'react';
import { useArchitectureStore } from '@/store/architecture-store';
import { authService } from '@/lib/auth-service';
import { LoginForm } from './LoginForm';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const authToken = useArchitectureStore((state) => state.authToken);
  const authUser = useArchitectureStore((state) => state.authUser);
  const isCheckingAuth = useArchitectureStore((state) => state.isCheckingAuth);
  const setAuthToken = useArchitectureStore((state) => state.setAuthToken);
  const setAuthUser = useArchitectureStore((state) => state.setAuthUser);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

        if (token) {
          // Token exists, try to validate by fetching user profile
          const user = await authService.getProfile();
          setAuthToken(token);
          setAuthUser(user);
        } else {
          // No token, mark auth check as complete
          setAuthUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        setAuthUser(null);
      }
    };

    checkAuth();
  }, [setAuthToken, setAuthUser]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authToken || !authUser) {
    return <LoginForm />;
  }

  return <>{children}</>;
};
