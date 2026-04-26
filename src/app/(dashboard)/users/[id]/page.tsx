'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { useToastStore } from '@/store/toast.store';
import { User, UserRole } from '@/types';
import { formatDate, getInitials, getRoleDisplayName } from '@/lib/utils';
import { 
  Loader2, 
  ChevronLeft, 
  Edit2, 
  Trash2, 
  Mail, 
  Shield, 
  Calendar,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Cpu,
  Database,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { error, success } = useToastStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await usersService.findById(id as string);
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          error('Identity not found');
          router.push('/users');
        }
      } catch (err) {
        error('Failed to access identity vault');
        router.push('/users');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id, error, router]);

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await usersService.delete(id as string);
      success('Identity successfully de-provisioned');
      router.push('/users');
    } catch {
      error('Failed to revoke identity access');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Synchronizing Identity...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link 
          href="/users" 
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
        >
          <div className="p-2 rounded-full bg-white shadow-sm border border-outline/30 group-hover:border-primary/30">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Directory Index</span>
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-6 py-3 border border-outline hover:border-primary/30 hover:bg-primary/5 text-on-surface-variant hover:text-primary rounded-xl transition-all group"
          >
            <Trash2 className="w-4 h-4 group-hover:shake" />
            <span className="text-[10px] font-black uppercase tracking-widest text-inherit">Revoke Access</span>
          </button>
          <Link 
            href={`/users/${id}/edit`}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Modify Parameters</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Snapshot */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-glass border border-outline/30 overflow-hidden">
            <div className="h-24 bg-on-surface relative">
               <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary font-black text-4xl">
                 {getInitials(user.firstName, user.lastName)}
               </div>
            </div>
            <div className="p-8 pt-16">
              <h3 className="text-2xl font-black tracking-tighter text-on-surface">{user.firstName} {user.lastName}</h3>
              <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">UID: {user.id.slice(0, 12)}...</p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-on-surface-variant" />
                  <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Infrastructure Metadata */}
          <div className="bg-surface/50 rounded-2xl border border-outline/30 p-6 space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline/20 pb-3">Infrastructure Specs</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="w-3 h-3" />
                  Status
                </span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Synchronized</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  Data Node
                </span>
                <span className="text-[9px] font-black text-on-surface uppercase tracking-widest">Master Registry</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Auth State
                </span>
                <span className="text-[9px] font-black text-on-surface uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Relations & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-glass border border-outline/30 p-8 lg:p-12">
            <h4 className="text-xl font-black tracking-tighter text-on-surface mb-8 pb-4 border-b border-outline/20 flex items-center justify-between">
              Organizational Context
              <span className="material-symbols-outlined text-primary/30">hub</span>
            </h4>

            {user.role === UserRole.STUDENT && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-surface p-6 rounded-2xl border border-outline/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Academic Track
                    </p>
                    <div className="text-lg font-black tracking-tight text-on-surface">{user.student?.track?.name || 'Unassigned'}</div>
                    <p className="text-xs text-on-surface-variant font-medium mt-2 leading-relaxed">
                      {user.student?.track?.description || 'No track description available.'}
                    </p>
                    <Link 
                      href={`/tracks/${user.student?.track?.id}`} 
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mt-6 hover:underline"
                    >
                      View Pathway Details
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="bg-surface p-6 rounded-2xl border border-outline/30 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Graduation Class</p>
                    <div className="text-4xl font-black text-on-surface tracking-tighter">
                      {user.student?.graduationYear || 'N/A'}
                    </div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-2">Certified Alumnus</p>
                  </div>
                </div>

                <section>
                   <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
                      Career Infrastructure
                    </p>
                    <div className="bg-white p-6 rounded-2xl border border-outline/50 border-dashed text-center">
                      <p className="text-sm font-medium text-on-surface-variant">Access Career Documents and CV history in the Specialized Student Module.</p>
                      <button 
                        onClick={() => router.push(`/students/${user.id}`)}
                        className="mt-4 px-6 py-2 bg-on-surface text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all"
                      >
                        Launch Student View
                      </button>
                    </div>
                </section>
              </div>
            )}

            {user.role === UserRole.COMPANY_REP && (
              <div className="space-y-12">
                <div className="bg-surface p-8 rounded-3xl border border-outline/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Partner Organization
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black tracking-tighter text-on-surface">{user.company?.companyName || 'Unassigned'}</div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {user.company?.location || 'Unknown'}
                      </div>
                    </div>
                    <Link 
                      href={`/companies/${user.company?.id}`}
                      className="p-3 bg-white shadow-soft rounded-full hover:bg-primary hover:text-white transition-all border border-outline/20"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>
                  <div className="mt-8 pt-6 border-t border-outline/20">
                    <p className="text-sm text-on-surface-variant font-medium leading-relaxed italic">
                      "{user.company?.description}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user.role !== UserRole.STUDENT && user.role !== UserRole.COMPANY_REP && (
              <div className="py-20 text-center">
                 <span className="material-symbols-outlined text-6xl text-primary/20 mb-4 block">hub</span>
                 <p className="text-sm font-medium text-on-surface-variant">Global System Administrator identities operate outside specific academic or partner tracks.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Revoke Identity Access?"
        message={`Warning: This will deactivate the account for ${user.firstName} ${user.lastName}. This action complies with global security protocols but may affect service continuity.`}
        confirmText="Revoke Now"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
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
    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded border flex items-center gap-1.5 w-fit ${styles}`}>
      <span className={`w-1 h-1 rounded-full ${styles.split(' ')[1].replace('text-', 'bg-')}`}></span>
      {getRoleDisplayName(role)}
    </span>
  );
}
