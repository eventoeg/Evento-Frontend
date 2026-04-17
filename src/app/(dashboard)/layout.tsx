'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard, { getFilteredNavItems } from '@/components/RoleGuard';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';
import { Loader2, Menu, X, LogOut, Search, Bell, Settings } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isInitialized, initialize } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    logout();
    router.push('/login');
    router.refresh();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AuthGuard>
    );
  }

  // All possible navigation items with their role requirements
  const allNavItems = [
    { label: 'System Overview', href: '/', icon: 'grid_view' },
    { label: 'Profile', href: '/profile', icon: 'account_circle' },
    { label: 'Companies', href: '/companies', icon: 'business' },
    { label: 'Academic Tracks', href: '/tracks', icon: 'school' },
    { label: 'Events', href: '/events', icon: 'event' },
    { label: 'Job Profiles', href: '/job-profiles', icon: 'work' },
    { label: 'Interviews', href: '/interviews', icon: 'video_chat' },
    { label: 'Student CVs', href: '/student-cvs', icon: 'description' },
    { label: 'Attendance', href: '/attendance', icon: 'how_to_reg' },
    { label: 'Feedback', href: '/feedback', icon: 'rate_review' },
    { label: 'User Management', href: '/users', icon: 'group' },
  ];

  // Filter navigation items based on user's role permissions
  const navItems = getFilteredNavItems(user.role, allNavItems);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-surface selection:bg-primary/10">
        {/* Navigation - Desktop */}
        <aside className="hidden md:flex flex-col h-screen sticky top-0 w-72 bg-white border-r border-outline/50 z-50 overflow-y-auto">
          <SidebarContent 
            user={user} 
            navItems={navItems} 
            pathname={pathname} 
            onLogout={handleLogout} 
          />
        </aside>

        {/* Navigation - Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Navigation - Mobile Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-outline transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <SidebarContent 
            user={user} 
            navItems={navItems} 
            pathname={pathname} 
            onLogout={handleLogout} 
            onClose={() => setMobileMenuOpen(false)}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex justify-between items-center w-full px-4 lg:px-12 py-4 glass-panel sticky top-0 z-40 border-b border-outline/30">
            <div className="flex items-center gap-4 lg:gap-12">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-on-surface-variant hover:bg-surface rounded-full transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <Link href="/" className="text-lg font-black tracking-tighter">
                ITI EMS <span className="text-primary">V3.</span>
              </Link>
              
              <nav className="hidden lg:flex items-center gap-8">
                {navItems.some(item => item.href === '/') && (
                  <Link href="/" className={`text-xs font-bold uppercase tracking-widest transition-colors ${pathname === '/' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'}`}>Dashboard</Link>
                )}
                {navItems.some(item => item.href === '/events') && (
                  <Link href="/events" className={`text-xs font-bold uppercase tracking-widest transition-colors ${pathname === '/events' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'}`}>Events</Link>
                )}
                {navItems.some(item => item.href === '/companies') && (
                  <Link href="/companies" className={`text-xs font-bold uppercase tracking-widest transition-colors ${pathname === '/companies' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-on-surface'}`}>Directory</Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              <div className="relative hidden xl:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                <input 
                  className="bg-surface/80 border border-outline/50 rounded-full pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                  placeholder="SEARCH SYSTEM..." 
                  type="text"
                />
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                <button className="p-2 text-on-surface-variant hover:bg-surface rounded-full transition-colors relative">
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                </button>
                <button className="p-2 text-on-surface-variant hover:bg-surface rounded-full transition-colors">
                  <span className="material-symbols-outlined">settings</span>
                </button>
              </div>
              <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10 shadow-soft flex items-center justify-center bg-primary text-white font-bold">
                {getInitials(user.firstName, user.lastName)}
              </Link>
            </div>
          </header>

          <main className="p-4 lg:p-12">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

function SidebarContent({ 
  user, navItems, pathname, onLogout, onClose 
}: { 
  user: any; navItems: any[]; pathname: string; onLogout: () => void; onClose?: () => void;
}) {
  return (
    <>
      <div className="p-8 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-on-surface tracking-tighter flex items-center gap-2">
            <span className="w-2 h-8 bg-primary block"></span>
            ITI EMS
          </h1>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.3em] mt-2">v3.0.0 • Master Spec</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-primary md:hidden">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center px-4 py-3 rounded-lg transition-all group ${
              pathname === item.href 
                ? 'bg-primary/5 text-primary' 
                : 'text-on-surface-variant hover:text-primary hover:bg-surface'
            }`}
          >
            <span className={`material-symbols-outlined mr-4 group-hover:scale-110 transition-transform ${pathname === item.href ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-surface p-4 rounded-xl mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[9px] text-on-surface-variant font-medium truncate">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary transition-colors py-2 group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">logout</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </>
  );
}
