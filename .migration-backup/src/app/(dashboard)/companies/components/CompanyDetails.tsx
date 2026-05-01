'use client';

import { Company, CompanyStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  Building2, 
  MapPin, 
  AlignLeft, 
  Calendar, 
  ShieldCheck, 
  Users,
  Briefcase,
  History,
  LayoutGrid
} from 'lucide-react';

interface CompanyDetailsProps {
  company: Company;
}

export default function CompanyDetails({ company }: CompanyDetailsProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface rounded-2xl border border-outline/30 p-6 flex flex-col items-center text-center">
            <div className="p-5 rounded-3xl bg-white border border-outline/50 text-primary shadow-sm mb-4">
              <Building2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black tracking-tighter text-on-surface">{company.companyName}</h3>
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] mt-2">Partner Organization</p>
            
            <div className="mt-8 w-full space-y-4 pt-6 border-t border-outline/20 text-left">
               <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Headquarters
                </span>
                <span className="text-xs font-black text-on-surface">{company.location || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Status
                </span>
                <StatusBadge status={company.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Onboarded
                </span>
                <span className="text-xs font-black text-on-surface">{formatDate(company.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-outline/20 p-5 space-y-4">
             <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
               <Users className="w-3.5 h-3.5" /> Team Roster
             </p>
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Reps</span>
                 <span className="text-xs font-black text-on-surface">{company.users?.length || 0} Accounts</span>
               </div>
             </div>
          </div>
        </div>

        {/* Operational Context */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-outline/30 p-8">
            <h4 className="text-lg font-black tracking-tighter text-on-surface mb-6 pb-4 border-b border-outline/20 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Organizational Parameters
            </h4>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <AlignLeft className="w-3.5 h-3.5" />
                  Profile Summary
                </p>
                <div className="text-sm text-on-surface-variant font-medium leading-relaxed bg-surface/50 p-6 rounded-xl border border-outline/20 italic">
                  "{company.description || 'No description provided for this entity.'}"
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                 <div className="p-5 rounded-2xl border border-outline/30 bg-surface/30 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl border border-outline/30 text-primary">
                       <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Industry Node</p>
                       <p className="text-sm font-black text-on-surface tracking-tight">Enterprise Partner</p>
                    </div>
                 </div>
                 <div className="p-5 rounded-2xl border border-outline/30 bg-surface/30 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl border border-outline/30 text-primary">
                       <History className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Audit Trail</p>
                       <p className="text-sm font-black text-on-surface tracking-tight">Verified Entity</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CompanyStatus }) {
  let styles = "";
  switch (status) {
    case CompanyStatus.APPROVED:
      styles = "bg-emerald-50 text-emerald-600 border-emerald-100";
      break;
    case CompanyStatus.PENDING:
      styles = "bg-amber-50 text-amber-600 border-amber-100";
      break;
    case CompanyStatus.REJECTED:
      styles = "bg-primary/5 text-primary border-primary/10";
      break;
  }

  return (
    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border flex items-center gap-1 w-fit ${styles}`}>
      {status}
    </span>
  );
}
