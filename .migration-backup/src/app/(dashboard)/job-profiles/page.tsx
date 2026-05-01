'use client';

import { useEffect, useState, useCallback } from 'react';
import { jobProfilesService } from '@/services/job-profiles.service';
import { companiesService } from '@/services/companies.service';
import { eventsService } from '@/services/events.service';
import { useToastStore } from '@/store/toast.store';
import SearchableSelect from '@/components/ui/SearchableSelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { JobProfile, Company, Event, CreateJobProfileDto, InterviewType, CompanyStatus } from '@/types';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Users
} from 'lucide-react';

export default function JobProfilesPage() {
  const { success, error } = useToastStore();
  const [profiles, setProfiles] = useState<JobProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<JobProfile | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<JobProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateJobProfileDto>({
    jobTitle: '',
    jobDescription: '',
    requiredPositions: 1,
    interviewType: InterviewType.TECHNICAL,
    companyId: '',
    eventId: '',
  });

  const fetchData = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const [profilesRes, companiesRes, eventsRes] = await Promise.all([
        jobProfilesService.findAll(page, 10),
        companiesService.findAll(1, 100, CompanyStatus.APPROVED),
        eventsService.findAll(1, 100),
      ]);

      if (profilesRes.success && profilesRes.data) {
        setProfiles(profilesRes.data.items);
        setTotalPages(profilesRes.data.pagination.totalPages);
        setTotalItems(profilesRes.data.pagination.total);
      }

      if (companiesRes.success && companiesRes.data) {
        setCompanies(companiesRes.data.items);
      }

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data.items);
      }
    } catch {
      error('Failed to synchronize job profile registry');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (selectedProfile) {
        await jobProfilesService.update(selectedProfile.id, formData);
        success('Job profile updated successfully');
      } else {
        await jobProfilesService.create(formData);
        success('Job profile published successfully');
      }
      setIsModalOpen(false);
      fetchData(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save job profile');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (profile: JobProfile) => {
    setProfileToDelete(profile);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;

    try {
      setDeleteLoading(true);
      await jobProfilesService.delete(profileToDelete.id);
      success('Job profile retired');
      setIsDeleteDialogOpen(false);
      setProfileToDelete(null);
      fetchData(currentPage);
    } catch {
      error('Failed to retire job profile');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await jobProfilesService.approve(id);
      success('Job profile authorized for recruitment');
      fetchData(currentPage);
    } catch {
      error('Failed to authorize job profile');
    }
  };

  const openModal = (profile: JobProfile | null = null) => {
    if (profile) {
      setSelectedProfile(profile);
      setFormData({
        jobTitle: profile.jobTitle,
        jobDescription: profile.jobDescription,
        requiredPositions: profile.requiredPositions,
        interviewType: profile.interviewType,
        companyId: profile.company?.id || '',
        eventId: profile.event?.id || '',
      });
    } else {
      setSelectedProfile(null);
      setFormData({
        jobTitle: '',
        jobDescription: '',
        requiredPositions: 1,
        interviewType: InterviewType.TECHNICAL,
        companyId: companies[0]?.id || '',
        eventId: events[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const filteredProfiles = profiles.filter(p => 
    p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.company?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Recruitment Engineering
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            Job <span className="font-black text-primary">Profiles</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Define recruitment criteria, technical requirements, and headcount targets for partner companies.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Publish New Profile
        </button>
      </section>

      {/* Search & List */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH BY TITLE OR PARTNER..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {totalItems} Published Opportunities Identified
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white h-80 rounded-2xl shadow-glass border border-outline/30 animate-pulse"></div>
            ))
          ) : filteredProfiles.length > 0 ? filteredProfiles.map((profile) => (
            <div key={profile.id} className="bg-white p-8 rounded-2xl shadow-glass border border-outline/30 group hover:border-primary/30 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">work</span>
                </div>
                <div className="flex gap-1">
                  {!profile.isApproved && (
                    <button 
                      onClick={() => handleApprove(profile.id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => openModal(profile)}
                    className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openDeleteDialog(profile)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-xl font-black tracking-tighter text-on-surface group-hover:text-primary transition-colors line-clamp-1">{profile.jobTitle}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                     <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                       profile.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                     }`}>
                     {profile.isApproved ? 'approved' : 'pending'}
                     </span>
                     <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                       <Target className="w-3 h-3" />
                       {profile.interviewType.replace('_', ' ')}
                     </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                    <Building2 className="w-4 h-4 text-on-surface-variant" />
                    {profile.company?.companyName}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                    <Calendar className="w-4 h-4 text-on-surface-variant" />
                    {profile.event?.title}
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant font-medium leading-relaxed line-clamp-3">
                  {profile.jobDescription}
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-outline/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  <Users className="w-4 h-4" />
                  <span>Target Headcount</span>
                </div>
                <div className="text-lg font-black text-on-surface">
                  {profile.requiredPositions}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-outline/30 shadow-glass">
              <div className="text-sm font-medium text-on-surface-variant">No job profiles identified in the system.</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems} profiles
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
      </section>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-outline/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-black tracking-tighter text-on-surface">
                  {selectedProfile ? 'Update' : 'Publish'} <span className="text-primary text-2xl">Profile</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">Recruitment Specification Form</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Position Title</label>
                <input 
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                  placeholder="e.g. Senior Backend Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  type="text"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Hosting Entity</label>
                  <SearchableSelect
                    options={companies.map((c) => ({ value: c.id, label: c.companyName }))}
                    value={formData.companyId}
                    onChange={(companyId) => setFormData({ ...formData, companyId })}
                    placeholder="Select company..."
                    searchPlaceholder="Search companies..."
                    emptyText="No companies found"
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Linked Event</label>
                  <SearchableSelect
                    options={events.map((event) => ({ value: event.id, label: event.title }))}
                    value={formData.eventId}
                    onChange={(eventId) => setFormData({ ...formData, eventId })}
                    placeholder="Select event..."
                    searchPlaceholder="Search events..."
                    emptyText="No events found"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Assessment Protocol</label>
                  <select 
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                    value={formData.interviewType}
                    onChange={(e) => setFormData({ ...formData, interviewType: e.target.value as InterviewType })}
                  >
                    {Object.values(InterviewType).map((type) => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Target Headcount</label>
                  <input 
                    required
                    min={1}
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                    value={formData.requiredPositions}
                    onChange={(e) => setFormData({ ...formData, requiredPositions: parseInt(e.target.value) })}
                    type="number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Mission Description</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none" 
                  placeholder="Summarize the core responsibilities..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Technical Requirements</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none" 
                  placeholder="List essential skills, technologies, and certifications..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
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
                  {selectedProfile ? 'Commit Update' : 'Publish Specification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen && !!profileToDelete}
        title="Delete this job profile?"
        message={`This action will remove ${profileToDelete?.jobTitle || 'the selected profile'} permanently.`}
        confirmText="Delete Profile"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setIsDeleteDialogOpen(false);
            setProfileToDelete(null);
          }
        }}
      />
    </div>
  );
}
