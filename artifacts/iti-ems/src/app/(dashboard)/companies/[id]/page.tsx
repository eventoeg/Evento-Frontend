
import { useParams, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { companiesService } from '@/services/companies.service';
import { useToastStore } from '@/store/toast.store';
import { Company, CompanyStatus, User } from '@/types';
import { formatDate, getStatusColor, getInitials } from '@/lib/utils';
import { 
  Loader2, 
  ChevronLeft, 
  Edit2, 
  Trash2, 
  Building, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Users as UsersIcon,
  Briefcase,
  History,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'wouter';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { error, success } = useToastStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompany() {
      try {
        setLoading(true);
        const res = await companiesService.findById(id as string);
        if (res.success && res.data) {
          setCompany(res.data);
        } else {
          error('Partner entity not found in registry');
          navigate('/companies');
        }
      } catch (err) {
        error('Failed to access partner synchronization node');
        navigate('/companies');
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [id, error, navigate]);

  const handleStatusChange = async (status: CompanyStatus) => {
    if (!company) return;
    try {
      setActionLoading(status);
      const res = await companiesService.update(company.id, { status });
      if (res.success) {
        setCompany({ ...company, status });
        success(`Partner status successfully updated to ${status}`);
      }
    } catch {
      error(`Failed to execute status transition to ${status}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await companiesService.delete(id as string);
      success('Partner entity successfully de-provisioned');
      navigate('/companies');
    } catch {
      error('Failed to revoke partner authorization');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Syncing Partner Hub...</p>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link 
          href="/companies" 
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
        >
          <div className="p-2 rounded-full bg-white shadow-sm border border-outline/30 group-hover:border-primary/30">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Partner Directory</span>
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-6 py-3 border border-outline hover:border-primary/30 hover:bg-primary/5 text-on-surface-variant hover:text-primary rounded-xl transition-all group"
          >
            <Trash2 className="w-4 h-4 group-hover:shake" />
            <span className="text-[10px] font-black uppercase tracking-widest">Withdraw Partnership</span>
          </button>
          <Link 
            href={`/companies/${id}/edit`}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Update Entity</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entity Snapshot */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-glass border border-outline/30 overflow-hidden">
            <div className="h-32 bg-primary/5 p-8 flex items-center justify-center">
               <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-outline/20 flex items-center justify-center text-primary">
                 <Building className="w-10 h-10" />
               </div>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(company.status)}`}>
                   {company.status}
                 </span>
                 <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-tighter">NODE: 0x{company.id.slice(0, 8)}</p>
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-on-surface leading-tight">{company.companyName}</h3>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 text-on-surface-variant">
                  <MapPin className="w-4 h-4 mt-1 shrink-0" />
                  <span className="text-xs font-medium">{company.location}</span>
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium truncate">Corporate Hub</span>
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <History className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">Joined {formatDate(company.createdAt)}</span>
                </div>
              </div>

              {/* Approval UI */}
              {company.status === CompanyStatus.PENDING && (
                <div className="mt-8 pt-8 border-t border-outline/20 space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Pending Authorization
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleStatusChange(CompanyStatus.REJECTED)}
                      className="flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex-1"
                    >
                      {actionLoading === CompanyStatus.REJECTED ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      Reject
                    </button>
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleStatusChange(CompanyStatus.APPROVED)}
                      className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex-1"
                    >
                      {actionLoading === CompanyStatus.APPROVED ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Info & Reps */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-glass border border-outline/30 p-8 lg:p-12">
            <h4 className="text-xl font-black tracking-tighter text-on-surface mb-8 pb-4 border-b border-outline/20">
              Corporate Overview
            </h4>
            <p className="text-base text-on-surface-variant font-medium leading-relaxed">
               {company.description}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-glass border border-outline/30 p-8 lg:p-12">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline/20">
              <h4 className="text-xl font-black tracking-tighter text-on-surface flex items-center gap-3">
                Authorized Representatives
                <span className="px-2 py-0.5 bg-surface text-on-surface-variant rounded text-[10px] font-bold">
                  {company.users?.length || 0}
                </span>
              </h4>
               <Link 
                href={`/users/new?role=company_rep&companyId=${id}`}
                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:underline"
              >
                Provision Representative
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.users && company.users.length > 0 ? (
                company.users!.map((rep: User) => (
                  <div key={rep.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 border border-outline/20 group hover:border-primary/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-white border border-outline/30 flex items-center justify-center font-black text-xs text-primary group-hover:scale-105 transition-transform">
                      {getInitials(rep.firstName, rep.lastName)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-on-surface">{rep.firstName} {rep.lastName}</div>
                      <div className="text-[10px] text-on-surface-variant font-medium lowercase mt-0.5">{rep.email}</div>
                    </div>
                    <Link 
                      href={`/users/${rep.id}`}
                      className="ml-auto p-2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center bg-surface/30 rounded-2xl border border-dashed border-outline/30">
                  <UsersIcon className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-3" />
                  <p className="text-xs font-medium text-on-surface-variant">Local representative pool is currently empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Withdraw Partnership?"
        message={`This will permanently revoke the organizational access for ${company.companyName}. All associated representative access will remain but organizational association will be dissolved.`}
        confirmText="Withdraw Partnership"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
