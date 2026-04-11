'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuthStore } from '@/store/auth.store';
import { useToastStore } from '@/store/toast.store';
import { dashboardApi } from '@/services/dashboard.service';
import { getInitials, formatDate } from '@/lib/utils';
import { UserRole, Company, User } from '@/types';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  BarChart3,
  Activity,
  Settings,
  Search,
  Bell,
  HelpCircle,
  Check,
  X,
  Loader2,
  LogOut,
  GraduationCap,
  Building2,
  CalendarDays,
  Video,
  TrendingUp,
  TrendingDown,
  Globe,
  Menu,
  Eye,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  );
}

function DashboardLayout() {
  const router = useRouter();
  const { user, logout, isInitialized, initialize } = useAuthStore();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    logout();
    router.push('/login');
    router.refresh();
  };

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    setMobileMenuOpen(false);
  };

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C1272D]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7FAFC]">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar - Desktop only */}
      <aside className="hidden lg:flex lg:w-64 bg-[#1F2937] flex-col flex-shrink-0">
        <SidebarContent 
          user={user} 
          activeNav={activeNav} 
          onNavClick={setActiveNav}
          onLogout={handleLogout}
        />
      </aside>

      {/* Sidebar - Mobile slide-out */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1F2937] transform transition-transform duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent 
          user={user} 
          activeNav={activeNav} 
          onNavClick={handleNavClick}
          onLogout={handleLogout}
          mobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 lg:py-4 flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-[#1F2937] hover:bg-slate-100 rounded-lg transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden sm:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources, students, or events..."
                className="w-full pl-10 pr-4 py-2 lg:py-2.5 bg-[#F7FAFC] border border-slate-200 rounded-lg text-sm text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D] transition-all"
              />
            </div>
          </div>

          <button className="sm:hidden p-2 text-slate-400 hover:text-[#1F2937] hover:bg-slate-100 rounded-lg transition-all">
            <Search className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 lg:gap-3 ml-auto">
            <button className="relative p-2 lg:p-2.5 text-slate-400 hover:text-[#1F2937] hover:bg-slate-100 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2 h-2 bg-[#C1272D] rounded-full"></span>
            </button>
            <button className="hidden sm:block p-2 lg:p-2.5 text-slate-400 hover:text-[#1F2937] hover:bg-slate-100 rounded-lg transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 lg:gap-3">
              <span className="hidden md:block text-sm font-medium text-[#1F2937]">Admin Overview</span>
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#006DBE] flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user.firstName, user.lastName)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeNav === 'dashboard' && <DashboardContent />}
          {activeNav === 'approvals' && <ApprovalsContent />}
          {activeNav === 'employees' && <PlaceholderContent title="Employees" description="Employee management coming soon." />}
          {activeNav === 'reports' && <PlaceholderContent title="Reports" description="Reports and analytics coming soon." />}
          {activeNav === 'system-status' && <PlaceholderContent title="System Status" description="System monitoring coming soon." />}
          {activeNav === 'settings' && <PlaceholderContent title="Settings" description="Settings panel coming soon." />}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ 
  user, activeNav, onNavClick, onLogout, mobile = false, onClose,
}: { 
  user: any; activeNav: string; onNavClick: (nav: string) => void;
  onLogout: () => void; mobile?: boolean; onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 lg:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C1272D] flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base">ITI EMS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Admin Console</p>
          </div>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={activeNav === 'dashboard'} onClick={() => onNavClick('dashboard')} />
        <SidebarItem icon={<FileCheck className="w-5 h-5" />} label="Approvals" active={activeNav === 'approvals'} onClick={() => onNavClick('approvals')} />
        <SidebarItem icon={<Users className="w-5 h-5" />} label="Employees" active={activeNav === 'employees'} onClick={() => onNavClick('employees')} />
        <SidebarItem icon={<BarChart3 className="w-5 h-5" />} label="Reports" active={activeNav === 'reports'} onClick={() => onNavClick('reports')} />
        <SidebarItem icon={<Activity className="w-5 h-5" />} label="System Status" active={activeNav === 'system-status'} onClick={() => onNavClick('system-status')} />
        <SidebarItem icon={<Settings className="w-5 h-5" />} label="Settings" active={activeNav === 'settings'} onClick={() => onNavClick('settings')} />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#006DBE] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors p-1 flex-shrink-0" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-white/10 text-white border-l-[3px] border-[#C1272D] pl-[9px]'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Dashboard Content with Stats
function DashboardContent() {
  const { success, error, info, warning } = useToastStore();
  const [stats, setStats] = useState({
    totalStudents: 0, pendingCompanies: 0, publishedEvents: 0, activeInterviews: 0,
    studentsTrend: '+12%', companiesTrend: '-3%',
  });
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('just now');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, companiesRes, eventsRes, interviewsRes] = await Promise.allSettled([
          dashboardApi.getUsers(1, 100),
          dashboardApi.getCompanies(1, 100),
          dashboardApi.getEvents(1, 100),
          dashboardApi.getInterviews(1, 100),
        ]);

        const statsData = { totalStudents: 0, pendingCompanies: 0, publishedEvents: 0, activeInterviews: 0, studentsTrend: '+12%', companiesTrend: '-3%' };
        let allUsers: User[] = [];
        let allCompanies: Company[] = [];

        if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
          allUsers = usersRes.value.data.data?.items || [];
          statsData.totalStudents = allUsers.filter(u => u.role === 'student').length;
        }
        if (companiesRes.status === 'fulfilled' && companiesRes.value.data.success) {
          allCompanies = companiesRes.value.data.data?.items || [];
          const pending = allCompanies.filter(c => c.status === 'pending');
          statsData.pendingCompanies = pending.length;
          setPendingCompanies(pending.slice(0, 3));
        }
        if (eventsRes.status === 'fulfilled' && eventsRes.value.data.success) {
          statsData.publishedEvents = eventsRes.value.data.data?.items?.length || 0;
        }
        if (interviewsRes.status === 'fulfilled' && interviewsRes.value.data.success) {
          statsData.activeInterviews = interviewsRes.value.data.data?.items?.length || 0;
        }

        setStats(statsData);
        setLastUpdated('just now');
      } catch (err) {
        error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#C1272D]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-light text-[#1F2937]">Admin Overview</h1>
        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#006DBE] inline-block"></span>
          System operational • Last updated {lastUpdated}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <StatCard icon={<GraduationCap className="w-5 h-5" />} iconBg="bg-red-50" iconColor="text-red-600" label="Total Students" value={stats.totalStudents.toLocaleString()} trend={stats.studentsTrend} trendType="positive" />
        <StatCard icon={<Building2 className="w-5 h-5" />} iconBg="bg-amber-50" iconColor="text-amber-600" label="Pending Companies" value={stats.pendingCompanies.toLocaleString()} trend={stats.companiesTrend} trendType="negative" />
        <StatCard icon={<CalendarDays className="w-5 h-5" />} iconBg="bg-blue-50" iconColor="text-blue-600" label="Published Events" value={stats.publishedEvents.toLocaleString()} />
        <StatCard icon={<Video className="w-5 h-5" />} iconBg="bg-green-50" iconColor="text-green-600" label="Active Interviews" value={stats.activeInterviews.toLocaleString()} live />
      </div>

      {/* Mini Approvals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-[#1F2937]">Company Approvals</h2>
            <p className="text-sm text-slate-500 mt-0.5 hidden sm:block">Review and authorize new partnership requests.</p>
          </div>
          <button className="text-sm font-semibold text-[#C1272D] hover:text-[#C1272D]/80 transition-colors whitespace-nowrap">View All</button>
        </div>
        {pendingCompanies.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pendingCompanies.map((company) => (
              <div key={company.id} className="px-4 lg:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#1F2937] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {company.companyName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1F2937] truncate">{company.companyName}</p>
                    <p className="text-xs text-slate-500 truncate">{company.location}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 whitespace-nowrap ml-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Pending
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No pending approvals</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card
function StatCard({ icon, iconBg, iconColor, label, value, trend, trendType, live }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: string;
  trend?: string; trendType?: 'positive' | 'negative'; live?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 lg:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>{icon}</div>
        {trend && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-xs font-semibold ${trendType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trendType === 'positive' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{trend}
          </span>
        )}
        {live && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-xs font-semibold bg-red-50 text-[#C1272D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C1272D] animate-pulse"></span>LIVE
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl lg:text-3xl font-bold text-[#1F2937]">{value}</p>
    </div>
  );
}

// Approvals Content with Pagination, Toasts, and Company Detail Modal
function ApprovalsContent() {
  const { success, error, info } = useToastStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDetailLoading, setCompanyDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 5;

  const fetchPendingCompanies = async (page: number) => {
    try {
      setLoading(true);
      const res = await dashboardApi.getCompanies(page, 100);
      if (res.data.success && res.data.data) {
        const pending = res.data.data.items.filter(c => c.status === 'pending');
        setTotalItems(pending.length);
        setTotalPages(Math.ceil(pending.length / ITEMS_PER_PAGE));
        // Slice for current page
        const start = (page - 1) * ITEMS_PER_PAGE;
        setCompanies(pending.slice(start, start + ITEMS_PER_PAGE));
      }
    } catch (err) {
      error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCompanies(currentPage);
  }, [currentPage]);

  const handleViewCompany = async (company: Company) => {
    setCompanyDetailLoading(true);
    setSelectedCompany(company);
    try {
      const res = await dashboardApi.getCompanyById(company.id);
      if (res.data.success && res.data.data) {
        setSelectedCompany(res.data.data);
      }
    } catch (err) {
      error('Failed to load company details');
    } finally {
      setCompanyDetailLoading(false);
    }
  };

  const handleApprove = async (company: Company) => {
    setActionLoading(company.id);
    try {
      await dashboardApi.approveCompany(company.id);
      success(`${company.companyName} has been approved successfully`);
      fetchPendingCompanies(currentPage);
      setSelectedCompany(null);
    } catch (err: any) {
      error(err.response?.data?.message || `Failed to approve ${company.companyName}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (company: Company) => {
    setActionLoading(company.id);
    try {
      await dashboardApi.rejectCompany(company.id);
      success(`${company.companyName} has been rejected`);
      fetchPendingCompanies(currentPage);
      setSelectedCompany(null);
    } catch (err: any) {
      error(err.response?.data?.message || `Failed to reject ${company.companyName}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#C1272D]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-light text-[#1F2937]">Company Approvals</h1>
        <p className="text-sm text-slate-500 mt-2">Review and authorize new partnership requests.</p>
      </div>

      {/* Company Approvals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Request Date</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.length > 0 ? companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-[#1F2937] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {company.companyName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1F2937] truncate">{company.companyName}</p>
                        <p className="text-xs text-slate-500 truncate">{company.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span className="text-sm text-slate-600 whitespace-nowrap">{formatDate(company.createdAt)}</span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-600">{company.location}</span>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Pending Review
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewCompany(company)}
                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors flex-shrink-0"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(company)}
                        disabled={actionLoading === company.id}
                        className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                        title="Approve"
                      >
                        {actionLoading === company.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleReject(company)}
                        disabled={actionLoading === company.id}
                        className="w-8 h-8 rounded-full bg-[#C1272D]/10 text-[#C1272D] hover:bg-[#C1272D]/20 flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                        title="Reject"
                      >
                        {actionLoading === company.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No pending approvals</p>
                    <p className="text-sm text-slate-400 mt-1">All company requests have been reviewed.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 lg:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} pending requests
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#C1272D] text-white'
                      : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          loading={companyDetailLoading}
          onClose={() => setSelectedCompany(null)}
          onApprove={() => handleApprove(selectedCompany)}
          onReject={() => handleReject(selectedCompany)}
          actionLoading={actionLoading === selectedCompany.id}
        />
      )}
    </div>
  );
}

// Company Detail Modal
function CompanyDetailModal({ company, loading, onClose, onApprove, onReject, actionLoading }: {
  company: Company;
  loading: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  actionLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-semibold text-[#1F2937]">Company Verification</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-[#1F2937] hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C1272D]" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Company Logo & Name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#1F2937] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {company.companyName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#1F2937]">{company.companyName}</h4>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Pending Review
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Location</p>
                  <p className="text-sm font-medium text-[#1F2937] mt-0.5">{company.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Request Date</p>
                  <p className="text-sm font-medium text-[#1F2937] mt-0.5">{formatDate(company.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Last Updated</p>
                  <p className="text-sm font-medium text-[#1F2937] mt-0.5">{formatDate(company.updatedAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <FileCheck className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Status</p>
                  <p className="text-sm font-medium text-amber-600 mt-0.5 capitalize">{company.status}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium mb-2">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{company.description}</p>
            </div>

            {/* Company ID */}
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-medium mb-1">Company ID</p>
              <p className="text-xs font-mono text-slate-600 break-all">{company.id}</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onReject}
            disabled={actionLoading || loading}
            className="px-4 py-2.5 text-sm font-medium text-[#C1272D] bg-[#C1272D]/10 rounded-xl hover:bg-[#C1272D]/20 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading || loading}
            className="px-4 py-2.5 text-sm font-medium text-white bg-[#C1272D] rounded-xl hover:bg-[#C1272D]/90 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-[#C1272D]/20"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Settings className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-slate-500 mt-2">{description}</p>
    </div>
  );
}
