
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { companiesService } from '@/services/companies.service';
import { useToastStore } from '@/store/toast.store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import RoleGuard, { PERMISSIONS } from '@/components/RoleGuard';
import CompanyForm from './components/CompanyForm';
import CompanyDetails from './components/CompanyDetails';
import { Company, CompanyStatus } from '@/types';
import { CompanyFormData } from '@/validations/company.schema';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';

export default function CompaniesPage() {
  const [, navigate] = useLocation();
  const { success, error } = useToastStore();
  
  // Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCompanies = useCallback(async (page: number, status: CompanyStatus | 'all', search: string) => {
    try {
      setLoading(true);
      const res = await companiesService.findAll(
        page,
        10,
        status === 'all' ? undefined : status,
        search
      );

      if (res.success && res.data) {
        setCompanies(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to load corporate partner registry');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchCompanies(currentPage, statusFilter, debouncedSearch);
  }, [currentPage, statusFilter, debouncedSearch, fetchCompanies]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedCompany(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, company: Company) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCompany(company);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (company: Company) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
  };

  const openDeleteDialog = (e: React.MouseEvent, company: Company) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CompanyFormData) => {
    try {
      setActionLoading(true);
      if (selectedCompany) {
        await companiesService.update(selectedCompany.id, data);
        success('Partner registry updated successfully');
      } else {
        await companiesService.create(data);
        success('New partner entity registered');
      }
      setIsFormModalOpen(false);
      fetchCompanies(currentPage, statusFilter, debouncedSearch);
    } catch (err: any) {
      error(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;

    try {
      setActionLoading(true);
      await companiesService.delete(selectedCompany.id);
      success('Partner entity successfully de-registered');
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      fetchCompanies(currentPage, statusFilter, debouncedSearch);
    } catch {
      error('Failed to revoke partner registration');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <RoleGuard requiredPermission={PERMISSIONS.VIEW_COMPANIES}>
      <div className="space-y-12">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
              Corporate Relations
            </div>
            <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
              Partner <span className="font-black text-primary">Directory</span>
            </h2>
            <p className="text-on-surface-variant text-base font-medium">
              Oversee industry partnerships, manage organizational profiles, and authorize corporate access.
            </p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
          >
            <Plus className="w-4 h-4" />
            Register Partner
          </button>
        </section>

        {/* Filters & Table */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input 
                className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                placeholder="SEARCH PARTNER ENTITIES..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {['all', ...Object.values(CompanyStatus)].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status as any);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    statusFilter === status 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'bg-surface text-on-surface-variant hover:bg-outline/30'
                  }`}
                >
                  {status === 'all' ? 'All Status' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Syncing Partner Registry...</p>
              </div>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface/50 border-b border-outline/30">
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Entity Name</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Authorization</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Primary Hub</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/20">
                    {companies.length > 0 ? companies.map((company) => (
                      <tr 
                        key={company.id} 
                        className="hover:bg-surface/30 transition-colors group cursor-pointer"
                        onClick={() => handleOpenView(company)}
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-surface border border-outline/50 text-primary flex items-center justify-center font-black text-xs">
                              {company.companyName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-black tracking-tight">{company.companyName}</div>
                              <div className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">ID: {company.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                           <StatusBadge status={company.status} />
                        </td>
                        <td className="p-6">
                          <div className="text-sm text-on-surface font-medium flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-on-surface-variant" />
                             {company.location || 'Global Headquarters'}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleOpenView(company); }}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleOpenEdit(e, company)}
                              className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                              title="Edit Registry"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => openDeleteDialog(e, company)}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              title="De-register"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                          <div className="text-sm font-medium text-on-surface-variant">No partner entities match the current query.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-6 border-t border-outline/30 flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                      Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems} entities
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-2 border border-outline/50 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-30 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="px-4 text-[10px] font-black uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                      </div>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2 border border-outline/50 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-30 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Partner Profile"
          subtitle="Corporate Entity Specifications"
          maxWidth="4xl"
        >
          {selectedCompany && <CompanyDetails company={selectedCompany} />}
        </Modal>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={selectedCompany ? 'Modify Registry' : 'Register Partner'}
          subtitle={selectedCompany ? 'Update Organizational Parameters' : 'New Industry Alignment'}
          maxWidth="2xl"
        >
          <CompanyForm 
            isEdit={!!selectedCompany}
            isLoading={actionLoading}
            initialData={selectedCompany ? {
              companyName: selectedCompany.companyName,
              location: selectedCompany.location,
              description: selectedCompany.description,
              status: selectedCompany.status,
            } : undefined}
            onSubmit={handleFormSubmit}
          />
        </Modal>

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen && !!selectedCompany}
          title="De-register Partner Entity?"
          message={`Warning: This will de-commission the registration for ${selectedCompany?.companyName}. This action is logged in the corporate audit trail.`}
          confirmText="Execute De-registration"
          cancelText="Cancel"
          loading={actionLoading}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!actionLoading) {
              setIsDeleteDialogOpen(false);
              setSelectedCompany(null);
            }
          }}
        />
      </div>
    </RoleGuard>
  );
}

function StatusBadge({ status }: { status: CompanyStatus }) {
  let styles = "";
  let Icon = Clock;
  switch (status) {
    case CompanyStatus.APPROVED:
      styles = "bg-emerald-50 text-emerald-600 border-emerald-100";
      Icon = CheckCircle2;
      break;
    case CompanyStatus.PENDING:
      styles = "bg-amber-50 text-amber-600 border-amber-100";
      Icon = Clock;
      break;
    case CompanyStatus.REJECTED:
      styles = "bg-primary/5 text-primary border-primary/10";
      Icon = XCircle;
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded border flex items-center gap-1.5 w-fit ${styles}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
