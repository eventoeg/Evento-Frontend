'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuthStore } from '@/store/auth.store';
import { dashboardApi } from '@/services/dashboard.service';
import { getRoleDisplayName, getInitials, getStatusColor } from '@/lib/utils';
import { UserRole, CompanyStatus, EventStatus } from '@/types';
import { 
  Users, 
  Building, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  ArrowRight,
  UserCircle,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user, logout, isInitialized, initialize } = useAuthStore();
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading until auth is initialized
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
    router.refresh();
  };

  const initials = getInitials(user.firstName, user.lastName);

  // Fetch stats based on user role
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData: Record<string, any> = {};

        if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) {
          // Fetch admin stats
          const [studentsRes, pendingRes, eventsRes] = await Promise.allSettled([
            dashboardApi.getStudentsCount(),
            dashboardApi.getPendingCompanies(),
            dashboardApi.getPublishedEvents(),
          ]);

          if (studentsRes.status === 'fulfilled' && studentsRes.value.data.success) {
            statsData.totalStudents = studentsRes.value.data.pagination?.total || 0;
          }
          if (pendingRes.status === 'fulfilled' && pendingRes.value.data.success) {
            statsData.pendingCompanies = pendingRes.value.data.pagination?.total || 0;
          }
          if (eventsRes.status === 'fulfilled' && eventsRes.value.data.success) {
            statsData.publishedEvents = eventsRes.value.data.pagination?.total || 0;
          }
        } else if (user.role === UserRole.STUDENT) {
          // Student stats - placeholder for now
          statsData.myTrack = user.student?.track?.name || 'Not assigned';
          statsData.cvStatus = user.student?.cvs?.length ? 'Uploaded' : 'Not uploaded';
        } else if (user.role === UserRole.COMPANY_REP) {
          // Company rep stats - placeholder
          statsData.myJobProfiles = 0;
          statsData.activeInterviews = 0;
        }

        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.role, user.student?.track?.name, user.student?.cvs?.length]);

  // Role-based quick actions
  const getQuickActions = () => {
    const actions = [];

    // Common actions
    actions.push({
      label: 'View Profile',
      icon: UserCircle,
      href: '/profile',
      color: 'blue' as const,
    });

    // Admin/Staff actions
    if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) {
      actions.push(
        { label: 'Manage Users', icon: Users, href: '/users', color: 'purple' as const },
        { label: 'Manage Companies', icon: Building, href: '/companies', color: 'orange' as const },
        { label: 'Manage Events', icon: Calendar, href: '/events', color: 'green' as const }
      );
    }

    // Student actions
    if (user.role === UserRole.STUDENT) {
      actions.push(
        { label: 'Browse Events', icon: Calendar, href: '/events', color: 'green' as const },
        { label: 'Job Profiles', icon: Briefcase, href: '/job-profiles', color: 'orange' as const },
        { label: 'My Queues', icon: Users, href: '/queues', color: 'purple' as const }
      );
    }

    // Company Rep actions
    if (user.role === UserRole.COMPANY_REP) {
      actions.push(
        { label: 'My Job Profiles', icon: Briefcase, href: '/job-profiles', color: 'orange' as const },
        { label: 'Interview Queues', icon: Users, href: '/queues', color: 'purple' as const },
        { label: 'Interviews', icon: Briefcase, href: '/interviews', color: 'green' as const }
      );
    }

    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-slate-600">{getRoleDisplayName(user.role)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                {initials}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <GraduationCap className="w-12 h-12 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">ITI Employment Management System</h2>
          <p className="text-blue-100 max-w-2xl">
            Manage events, interviews, companies, and student employment opportunities all in one place.
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {user.role === UserRole.ADMIN || user.role === UserRole.STAFF ? (
              <>
                <StatCard 
                  label="Total Students" 
                  value={stats.totalStudents || 0} 
                  icon={Users}
                  trend="+12%"
                  link="/students"
                />
                <StatCard 
                  label="Pending Companies" 
                  value={stats.pendingCompanies || 0} 
                  icon={Building}
                  color={stats.pendingCompanies > 0 ? 'red' : 'green'}
                  link="/companies?status=pending"
                />
                <StatCard 
                  label="Published Events" 
                  value={stats.publishedEvents || 0} 
                  icon={Calendar}
                  link="/events"
                />
                <StatCard 
                  label="Total Interviews" 
                  value="Coming Soon" 
                  icon={Briefcase}
                  link="/interviews"
                />
              </>
            ) : user.role === UserRole.STUDENT ? (
              <>
                <StatCard 
                  label="My Track" 
                  value={stats.myTrack || 'N/A'} 
                  icon={GraduationCap}
                  link="/profile"
                />
                <StatCard 
                  label="CV Status" 
                  value={stats.cvStatus || 'Not uploaded'} 
                  icon={CheckCircle}
                  link="/profile"
                />
                <StatCard 
                  label="Events Available" 
                  value="Coming Soon" 
                  icon={Calendar}
                  link="/events"
                />
                <StatCard 
                  label="My Applications" 
                  value="Coming Soon" 
                  icon={Briefcase}
                  link="/job-profiles"
                />
              </>
            ) : user.role === UserRole.COMPANY_REP ? (
              <>
                <StatCard 
                  label="My Job Profiles" 
                  value={stats.myJobProfiles || 0} 
                  icon={Briefcase}
                  link="/job-profiles"
                />
                <StatCard 
                  label="Active Interviews" 
                  value={stats.activeInterviews || 0} 
                  icon={Users}
                  link="/interviews"
                />
                <StatCard 
                  label="Students in Queue" 
                  value="Coming Soon" 
                  icon={Clock}
                  link="/queues"
                />
                <StatCard 
                  label="Pending Invitations" 
                  value="Coming Soon" 
                  icon={AlertCircle}
                  link="/invitations"
                />
              </>
            ) : (
              <>
                <StatCard label="Role" value={getRoleDisplayName(user.role)} icon={UserCircle} />
                <StatCard label="Status" value="Active" icon={CheckCircle} />
                <StatCard label="Events" value="Coming Soon" icon={Calendar} />
                <StatCard label="Activities" value="Coming Soon" icon={Briefcase} />
              </>
            )}
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
                purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
                orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200',
                green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
              };
              
              return (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className={`p-6 rounded-xl border transition-all text-left flex items-center justify-between ${colorClasses[action.color]}`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className="w-8 h-8" />
                    <span className="font-semibold">{action.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  link 
}: { 
  label: string; 
  value: string | number; 
  icon: any;
  trend?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  link?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
