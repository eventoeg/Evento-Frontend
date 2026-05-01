
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/auth.store';
import RoleGuard from '@/components/RoleGuard';

export default function CompanyRepDashboardPage() {
  return (
    <RoleGuard requiredPermission="VIEW_DASHBOARD" fallback={<AccessDenied />}> 
      <CompanyRepDashboardContent />
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

function CompanyRepDashboardContent() {
  const [, navigate] = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    navigate('/company-dashboard');
  }, [user, navigate]);

  return null;
}
