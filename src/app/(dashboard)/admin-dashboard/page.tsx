"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import RoleGuard from '@/components/RoleGuard';

export default function AdminDashboardPage() {
  return (
    <RoleGuard requiredPermission="VIEW_DASHBOARD" fallback={<AccessDenied />}> 
      <AdminDashboardContent />
    </RoleGuard>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
    </div>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    router.replace('/dashboard');
  }, [user, router]);

  return null;
}
