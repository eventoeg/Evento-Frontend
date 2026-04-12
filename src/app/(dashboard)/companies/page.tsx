'use client';

import { useEffect, useState, useCallback } from 'react';
import { companiesService } from '@/services/companies.service';
import { useToastStore } from '@/store/toast.store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Company, CompanyStatus, CreateCompanyDto } from '@/types';
import { 
  Loader2, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

type CompanyFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function CompaniesPage() {
  const { success, error } = useToastStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<CompanyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateCompanyDto>({
    companyName: '',
    description: '',
    location: '',
  });

  const fetchCompanies = useCallback(async (page: number, status: CompanyFilter, search: string) => {
    try {
      setLoading(true);
      const res = await companiesService.findAll(
        page, 
        10, 
        status === 'all' ? undefined : (status as CompanyStatus),
        search
      );
      if (res.success && res.data) {
        setCompanies(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to load companies');
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

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (selectedCompany) {
        await companiesService.update(selectedCompany.id, formData);
        success('Company updated successfully');
      } else {
        await companiesService.create(formData);
        success('Company created successfully');
      }
      setIsModalOpen(false);
      fetchCompanies(currentPage, statusFilter, debouncedSearch);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save company');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;

    try {
      setDeleteLoading(true);
      await companiesService.delete(companyToDelete.id);
      success('Company deleted successfully');
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      fetchCompanies(currentPage, statusFilter, debouncedSearch);
    } catch {
      error('Failed to delete company');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await companiesService.approve(id);
      success('Company approved');
      fetchCompanies(currentPage, statusFilter, debouncedSearch);
    } catch {
      error('Failed to approve company');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await companiesService.reject(id);
      success('Company rejected');
      fetchCompanies(currentPage, statusFilter, debouncedSearch);
    } catch {
      error('Failed to reject company');
    }
  };

  const openModal = (company: Company | null = null) => {
    if (company) {
      setSelectedCompany(company);
      setFormData({
        companyName: company.companyName,
        description: company.description,
        location: company.location,
      });
    } else {
      setSelectedCompany(null);
      setFormData({
        companyName: '',
        description: '',
        location: '',
      });
    }
    setIsModalOpen(true);
  };

  const openDetailModal = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Partner Directory
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            Company <span className="font-black text-primary">Management</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Review, authorize, and manage industry partnerships and recruitment profiles.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Register Company
        </button>
      </section>

      {/* Filters & Table */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH COMPANIES..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  statusFilter === status 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-surface text-on-surface-variant hover:bg-outline/30'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Accessing Registry...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/50 border-b border-outline/30">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Company Entity</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Location</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Joined</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {companies.length > 0 ? companies.map((company) => (
                    <tr key={company.id} className="hover:bg-surface/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-on-surface text-white flex items-center justify-center font-black text-lg">
                            {company.companyName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-black tracking-tight">{company.companyName}</div>
                            <div className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">REF: {company.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <StatusBadge status={company.status} />
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-sm text-on-surface font-medium">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                          {company.location}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openDetailModal(company)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openModal(company)}
                            className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {company.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(company.id)}
                                className="p-2 text-on-surface-variant hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleReject(company.id)}
                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => openDeleteDialog(company)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="text-sm font-medium text-on-surface-variant">No matching records found in the registry.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-outline/30 flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                    Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems} entries
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="p-8 border-b border-outline/30 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tighter text-on-surface">
                  {selectedCompany ? 'Edit' : 'Register'} <span className="text-primary text-2xl">Company</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">Registry Entry Form</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Legal Entity Name</label>
                <input 
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                  placeholder="e.g. Global Tech Solutions"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  type="text"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Operational Location</label>
                <input 
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                  placeholder="e.g. Cairo, Egypt"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  type="text"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Entity Description</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none" 
                  placeholder="Provide a brief overview of the company's focus and mission..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-outline text-on-surface-variant py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={formLoading}
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {selectedCompany ? 'Update Entry' : 'Commit to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="h-32 bg-on-surface relative">
               <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-on-surface font-black text-4xl">
                 {selectedCompany.companyName.charAt(0)}
               </div>
               <button 
                 onClick={() => setIsDetailModalOpen(false)}
                 className="absolute top-4 right-4 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-8 pt-16">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-on-surface">{selectedCompany.companyName}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <StatusBadge status={selectedCompany.status} />
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {selectedCompany.location}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedCompany.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(selectedCompany.id)}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(selectedCompany.id)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-12 space-y-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4 border-b border-outline/30 pb-2">Business Profile</p>
                  <p className="text-sm text-on-surface leading-relaxed font-medium">
                    {selectedCompany.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Registry Reference</p>
                    <p className="text-xs font-mono font-bold text-on-surface">{selectedCompany.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Authorization Date</p>
                    <p className="text-xs font-bold text-on-surface">
                      {selectedCompany.status === 'approved' ? new Date(selectedCompany.updatedAt).toLocaleString() : 'Pending Authorization'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex justify-end">
                <button 
                  onClick={() => openModal(selectedCompany)}
                  className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
                >
                  <Edit2 className="w-3 h-3" />
                  Update Registry Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen && !!companyToDelete}
        title="Delete this company?"
        message={`This will remove ${companyToDelete?.companyName || 'the selected company'} from the registry.`}
        confirmText="Delete Company"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setIsDeleteDialogOpen(false);
            setCompanyToDelete(null);
          }
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-100 flex items-center gap-1.5 w-fit">
          <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
          Approved
        </span>
      );
    case 'pending':
      return (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded border border-amber-100 flex items-center gap-1.5 w-fit">
          <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></span>
          Pending
        </span>
      );
    case 'rejected':
      return (
        <span className="px-2.5 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest rounded border border-primary/10 flex items-center gap-1.5 w-fit">
          <span className="w-1 h-1 bg-primary rounded-full"></span>
          Rejected
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded border border-slate-200 flex items-center gap-1.5 w-fit">
          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
          {status}
        </span>
      );
  }
}
