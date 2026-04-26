"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types';
import RoleGuard from '@/components/RoleGuard';

export default function StudentDashboardPage() {
  return (
    <RoleGuard requiredPermission="VIEW_DASHBOARD" fallback={<AccessDenied />}> 
      <StudentDashboardContent />
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

function StudentDashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    // redirect to first available page for students
    router.replace('/events');
  }, [user, router]);

  return null;
}
