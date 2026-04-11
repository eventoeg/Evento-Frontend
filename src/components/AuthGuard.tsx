'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
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
  if (!isInitialized && !isLoading) {
    // Still initializing, show loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // After initialization, redirect if not authenticated
  if (isInitialized && !isAuthenticated && !user) {
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname || '/')}`;
    router.push(loginUrl);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If user exists and is authenticated, render children
  if (isInitialized && user && isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}
