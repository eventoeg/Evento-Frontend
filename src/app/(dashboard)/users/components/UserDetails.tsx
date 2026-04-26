'use client';

import { User, UserRole } from '@/types';
import { formatDate, getInitials, getRoleDisplayName } from '@/lib/utils';
import { 
  Mail, 
  Shield, 
  Calendar,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Cpu,
  Database,
  Lock,
  Hub
} from 'lucide-react';
import Link from 'next/link';

interface UserDetailsProps {
  user: User;
}

export default function UserDetails({ user }: UserDetailsProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Snapshot */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface rounded-2xl border border-outline/30 overflow-hidden">
            <div className="h-20 bg-on-surface relative">
               <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary font-black text-3xl">
                 {getInitials(user.firstName, user.lastName)}
               </div>
            </div>
            <div className="p-6 pt-12">
              <h3 className="text-xl font-black tracking-tighter text-on-surface">{user.firstName} {user.lastName}</h3>
              <p className="text-[9px] text-on-surface-variant font-mono uppercase mt-1">UID: {user.id.slice(0, 12)}...</p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-on-surface-variant overflow-hidden">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-[11px] font-medium truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-3.5 h-3.5 text-on-surface-variant flex-shrink-0" />
                  <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-[11px] font-medium">Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Specs */}
          <div className="bg-surface/30 rounded-xl border border-outline/20 p-5 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/10 pb-2 flex items-center gap-2">
               <Cpu className="w-3 h-3" /> System Specs
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Status</span>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Synchronized</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Data Node</span>
                <span className="text-[8px] font-black text-on-surface uppercase tracking-widest">Master Registry</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Relations */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-outline/30 p-6">
            <h4 className="text-lg font-black tracking-tighter text-on-surface mb-6 pb-3 border-b border-outline/20 flex items-center justify-between">
              Organizational Context
            </h4>

            {user.role === UserRole.STUDENT && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-surface p-5 rounded-xl border border-outline/30">
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      Academic Track
                    </p>
                    <div className="text-base font-black tracking-tight text-on-surface">{user.student?.track?.name || 'Unassigned'}</div>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-2 leading-relaxed line-clamp-2">
                      {user.student?.track?.description || 'No track description available.'}
                    </p>
                  </div>

                  <div className="bg-surface p-5 rounded-xl border border-outline/30 flex flex-col justify-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Graduation Class</p>
                    <div className="text-3xl font-black text-on-surface tracking-tighter">
                      {user.student?.graduationYear || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {user.role === UserRole.COMPANY_REP && (
              <div className="space-y-6">
                <div className="bg-surface p-6 rounded-2xl border border-outline/30">
                  <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    Partner Organization
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-black tracking-tighter text-on-surface">{user.company?.companyName || 'Unassigned'}</div>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {user.company?.location || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-outline/20">
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic line-clamp-3">
                      "{user.company?.description}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user.role !== UserRole.STUDENT && user.role !== UserRole.COMPANY_REP && (
              <div className="py-12 text-center">
                 <span className="material-symbols-outlined text-4xl text-primary/20 mb-3 block">hub</span>
                 <p className="text-xs font-medium text-on-surface-variant">Global System Administrator identities operate outside specific academic or partner tracks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  let styles = "";
  switch (role) {
    case UserRole.ADMIN:
      styles = "bg-violet-50 text-violet-600 border-violet-100";
      break;
    case UserRole.STAFF:
      styles = "bg-blue-50 text-blue-600 border-blue-100";
      break;
    case UserRole.STUDENT:
      styles = "bg-emerald-50 text-emerald-600 border-emerald-100";
      break;
    case UserRole.COMPANY_REP:
      styles = "bg-amber-50 text-amber-600 border-amber-100";
      break;
    case UserRole.SECURITY:
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      break;
  }

  return (
    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border flex items-center gap-1 w-fit ${styles}`}>
      <span className={`w-1 h-1 rounded-full ${styles.split(' ')[1].replace('text-', 'bg-')}`}></span>
      {getRoleDisplayName(role)}
    </span>
  );
}
