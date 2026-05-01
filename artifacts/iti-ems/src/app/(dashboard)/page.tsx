
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useLocation } from 'wouter';
import { dashboardApi } from '@/services/dashboard.service';
import { useAuthStore } from '@/store/auth.store';
import { useToastStore } from '@/store/toast.store';
import { Company, UserRole } from '@/types';
import { 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Building2,
  CalendarCheck2,
  Users2,
  Video
} from 'lucide-react';

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { user, isInitialized } = useAuthStore();
  const { error } = useToastStore();
  
  // Stats state
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingCompanies: 0,
    publishedEvents: 0,
    activeInterviews: 0,
    studentsTrend: '+12%',
    companiesTrend: '-3%',
  });
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Role-based redirection
  useEffect(() => {
    if (isInitialized && user) {
      if (user.role === UserRole.COMPANY_REP) {
        navigate('/company-dashboard');
      } else if (user.role === UserRole.STUDENT) {
        // Redirect to a student-specific page if one exists, 
        // otherwise let them see a limited dashboard
        // navigate('/student-dashboard'); 
      }
    }
  }, [user, isInitialized, navigate]);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    // Only fetch for admin/staff
    if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.STAFF) return;
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [usersRes, companiesRes, eventsRes, interviewsRes] = await Promise.allSettled([
        dashboardApi.getUsers(1, 100),
        dashboardApi.getCompanies(1, 100),
        dashboardApi.getEvents(1, 100),
        dashboardApi.getInterviews(1, 100),
      ]);

      const statsData = {
        totalStudents: 0,
        pendingCompanies: 0,
        publishedEvents: 0,
        activeInterviews: 0,
        studentsTrend: '+12%',
        companiesTrend: '-3%'
      };

      if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
        const allUsers = usersRes.value.data.data?.items || [];
        statsData.totalStudents = allUsers.filter((u) => u.role === 'student').length;
      }

      if (companiesRes.status === 'fulfilled' && companiesRes.value.data.success) {
        const allCompanies = companiesRes.value.data.data?.items || [];
        const pending = allCompanies.filter((c) => c.status === 'pending');
        statsData.pendingCompanies = pending.length;
        setPendingCompanies(pending.slice(0, 5));
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value.data.success) {
        statsData.publishedEvents = eventsRes.value.data.data?.items?.length || 0;
      }

      if (interviewsRes.status === 'fulfilled' && interviewsRes.value.data.success) {
        statsData.activeInterviews = interviewsRes.value.data.data?.items?.length || 0;
      }

      setStats(statsData);
      setLastUpdated(new Date());
    } catch {
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-14 max-w-[1400px]">
      {/* Hero Section */}
      <section className="bg-white rounded-3xl border border-outline/30 shadow-glass p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-4xl">
            <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
              System Overview
            </div>
            <h2 className="text-4xl lg:text-6xl font-light tracking-tight text-on-surface mb-3">
              ITI EMS V3 <br />
              <span className="font-black text-primary">Admin Intelligence</span>
            </h2>
            <p className="text-on-surface-variant text-base lg:text-lg leading-relaxed max-w-2xl font-medium">
              Real-time metrics and operational visibility across students, partners, events, and interview pipelines.
            </p>
          </div>

          <div className="flex flex-col items-start xl:items-end gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh Data
            </button>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
          <QuickActionCard href="/users" title="Manage Users" subtitle="Control permissions" icon={<Users2 className="w-4 h-4" />} />
          <QuickActionCard href="/companies" title="Review Companies" subtitle="Approve onboarding" icon={<Building2 className="w-4 h-4" />} />
          <QuickActionCard href="/events" title="Plan Events" subtitle="Publish schedules" icon={<CalendarCheck2 className="w-4 h-4" />} />
          <QuickActionCard href="/interviews" title="Interview Queue" subtitle="Track active sessions" icon={<Video className="w-4 h-4" />} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-4">
          <span className="section-number text-5xl">01</span>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant mt-4 mb-2">Key Performance</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Core system metrics across students, companies, and events.</p>
        </div>
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard 
            label="Total Students" 
            value={stats.totalStudents.toString()} 
            icon="school" 
            trend={stats.studentsTrend} 
            trendType="positive" 
          />
          <StatCard 
            label="Pending Partners" 
            value={stats.pendingCompanies.toString()} 
            icon="business" 
            trend={stats.companiesTrend} 
            trendType="negative" 
          />
          <StatCard 
            label="Live Events" 
            value={stats.publishedEvents.toString()} 
            icon="event" 
          />
          <StatCard 
            label="Active Interviews" 
            value={stats.activeInterviews.toString()} 
            icon="video_chat" 
            isLive 
          />
        </div>
      </section>

      {/* Recent Approvals Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-4">
          <span className="section-number text-5xl">02</span>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant mt-4 mb-2">Action Required</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Priority tasks requiring administrative attention and authorization.</p>
        </div>
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Pending Company Approvals</h4>
            <Link href="/companies" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline inline-flex items-center gap-1">
              View All Requests
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
            {pendingCompanies.length > 0 ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface/50 border-b border-outline/30">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Company Entity</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Location</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/20">
                      {pendingCompanies.map((company) => (
                        <tr key={company.id} className="hover:bg-surface/30 transition-colors group">
                          <td className="p-6">
                            <div className="text-sm font-black tracking-tight">{company.companyName}</div>
                            <div className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">ID: {company.id.slice(0, 8)}</div>
                          </td>
                          <td className="p-6">
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded border border-amber-100 flex items-center gap-1.5 w-fit">
                              <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></span>
                              Review Pending
                            </span>
                          </td>
                          <td className="p-6 text-sm text-on-surface-variant font-medium">{company.location || 'Not specified'}</td>
                          <td className="p-6 text-right">
                            <Link href="/companies" className="text-on-surface-variant hover:text-primary transition-colors inline-flex">
                              <span className="material-symbols-outlined">chevron_right</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-outline/20">
                  {pendingCompanies.map((company) => (
                    <div key={company.id} className="p-5 space-y-3">
                      <div>
                        <p className="text-sm font-black tracking-tight">{company.companyName}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">ID: {company.id.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded border border-amber-100">
                          Review Pending
                        </span>
                        <Link href="/companies" className="text-[10px] font-black uppercase tracking-widest text-primary inline-flex items-center gap-1">
                          Open
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm text-on-surface-variant font-medium">No pending approvals found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* System Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-24">
        <div className="lg:col-span-4">
          <span className="section-number text-5xl">03</span>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant mt-4 mb-2">System Status</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Infrastructure health and automated protocol logs.</p>
        </div>
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 rounded-r-xl flex gap-5 items-start shadow-sm">
            <CheckCircle2 className="text-emerald-600 w-5 h-5 mt-0.5" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Protocol Nominal: All Systems Go</p>
              <p className="text-sm text-emerald-900/70 mt-1 font-medium leading-relaxed">
                Database synchronization and API services are operating within optimal latency parameters.
              </p>
            </div>
          </div>
          <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl flex gap-5 items-start shadow-sm">
            <AlertCircle className="text-primary w-5 h-5 mt-0.5" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Advisory: Maintenance Scheduled</p>
              <p className="text-sm text-primary/70 mt-1 font-medium leading-relaxed">
                Routine database optimization scheduled for April 12th, 02:00 UTC. Expected downtime: 15 minutes.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-outline/30 shadow-glass p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4">Operational Summary</p>
            <div className="grid grid-cols-2 gap-3">
              <MetricPill label="Students" value={stats.totalStudents} />
              <MetricPill label="Pending" value={stats.pendingCompanies} tone="warning" />
              <MetricPill label="Events" value={stats.publishedEvents} />
              <MetricPill label="Interviews" value={stats.activeInterviews} tone="live" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group bg-surface border border-outline/50 hover:border-primary/30 rounded-xl p-4 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg bg-white border border-outline/40 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-on-surface">{title}</p>
      <p className="mt-1 text-[11px] text-on-surface-variant font-medium">{subtitle}</p>
    </Link>
  );
}

function MetricPill({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'warning' | 'live' }) {
  let toneClass = 'bg-surface text-on-surface';
  if (tone === 'warning') toneClass = 'bg-amber-50 text-amber-700';
  if (tone === 'live') toneClass = 'bg-primary/5 text-primary';

  return (
    <div className={`rounded-lg px-3 py-3 border border-outline/30 ${toneClass}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-1 text-xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-[1400px] animate-pulse">
      <div className="bg-white rounded-3xl border border-outline/30 shadow-glass p-8 h-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white h-44 rounded-2xl border border-outline/30 shadow-glass" />
        ))}
      </div>
      <div className="bg-white h-80 rounded-2xl border border-outline/30 shadow-glass" />
    </div>
  );
}

function StatCard({ label, value, icon, trend, trendType, isLive }: { 
  label: string; value: string; icon: string; trend?: string; trendType?: 'positive' | 'negative'; isLive?: boolean;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-glass border border-outline/30 group hover:border-primary/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trendType === 'positive' ? 'text-emerald-600' : 'text-primary'}`}>
            {trendType === 'positive' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
        {isLive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">
            <span className="w-1 h-1 bg-white rounded-full"></span>
            Live
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-2">{label}</p>
      <p className="text-4xl font-black tracking-tight text-on-surface">{value}</p>
    </div>
  );
}
