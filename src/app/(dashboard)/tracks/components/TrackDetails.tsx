'use client';

import { Track } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  GraduationCap, 
  AlignLeft, 
  Calendar, 
  Users,
  Database,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';

interface TrackDetailsProps {
  track: Track;
}

export default function TrackDetails({ track }: TrackDetailsProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface rounded-2xl border border-outline/30 p-6 flex flex-col items-center text-center">
            <div className="p-5 rounded-3xl bg-white border border-outline/50 text-primary shadow-sm mb-4">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black tracking-tighter text-on-surface">{track.name}</h3>
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] mt-2">Academic Pathway</p>
            
            <div className="mt-8 w-full space-y-4 pt-6 border-t border-outline/20 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Roster Size
                </span>
                <span className="text-xs font-black text-on-surface">{track.students?.length || 0} Students</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Initialized
                </span>
                <span className="text-xs font-black text-on-surface">{formatDate(track.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" />
                  Data Node
                </span>
                <span className="text-xs font-black text-on-surface">Curriculum v3</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5 flex gap-4 items-start">
             <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
             <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Active Deployment</p>
               <p className="text-[10px] text-emerald-900/70 font-medium mt-1">This track is currently serving active student cohorts.</p>
             </div>
          </div>
        </div>

        {/* Detailed Context */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-outline/30 p-8">
            <h4 className="text-lg font-black tracking-tighter text-on-surface mb-6 pb-4 border-b border-outline/20 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Curriculum Parameters
            </h4>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <AlignLeft className="w-3.5 h-3.5" />
                  Learning Objectives & Description
                </p>
                <div className="text-sm text-on-surface-variant font-medium leading-relaxed bg-surface/50 p-6 rounded-xl border border-outline/20">
                  {track.description || 'No curricular description provided.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl border border-outline/30 bg-surface/30">
                    <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Resource Allocation</p>
                    <p className="text-xs font-black text-on-surface">Optimized</p>
                 </div>
                 <div className="p-4 rounded-xl border border-outline/30 bg-surface/30">
                    <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Sync Frequency</p>
                    <p className="text-xs font-black text-on-surface">Real-time</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
