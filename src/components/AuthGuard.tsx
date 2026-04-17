'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export default function AuthGuard({
  children,
  requireAdmin = false,
  requiredRole,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, isLoading, initialize } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect if not initialized yet (loading state)
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Once initialized, check if authenticated
  if (isInitialized && !isLoading && !isAuthenticated && !user) {
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname || '/')}`;
    router.push(loginUrl);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If user exists and is authenticated, check role permissions
  if (isInitialized && user && isAuthenticated) {
    // Check requireAdmin (legacy support - maps to ADMIN role)
    if (requireAdmin && user.role !== UserRole.ADMIN) {
      return (
        <>
          {fallback || (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 mb-2">Access Denied</p>
                <p className="text-slate-600">You don't have permission to access this page.</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </>
      );
    }

    // Check specific required role
    if (requiredRole && user.role !== requiredRole) {
      return (
        <>
          {fallback || (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 mb-2">Access Denied</p>
                <p className="text-slate-600">
                  This page requires <span className="font-semibold">{requiredRole}</span> role.
                  Your current role: <span className="font-semibold">{user.role}</span>
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </>
      );
    }

    // All checks passed, render children
    return <>{children}</>;
  }

  // Fallback loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}
