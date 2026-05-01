
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { tracksService } from '@/services/tracks.service';
import { useToastStore } from '@/store/toast.store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import RoleGuard, { PERMISSIONS } from '@/components/RoleGuard';
import TrackForm from './components/TrackForm';
import TrackDetails from './components/TrackDetails';
import { Track } from '@/types';
import { formatDate } from '@/lib/utils';
import { TrackFormData } from '@/validations/track.schema';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

export default function TracksPage() {
  const [, navigate] = useLocation();
  const { success, error } = useToastStore();
  
  // Data State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTracks = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      const res = await tracksService.findAll(page, 10, search);

      if (res.success && res.data) {
        setTracks(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to load curricular deployment registry');
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
    fetchTracks(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchTracks]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedTrack(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTrack(track);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (track: Track) => {
    setSelectedTrack(track);
    setIsViewModalOpen(true);
  };

  const openDeleteDialog = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTrack(track);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: TrackFormData) => {
    try {
      setActionLoading(true);
      if (selectedTrack) {
        await tracksService.update(selectedTrack.id, data);
        success('Academic track updated successfully');
      } else {
        await tracksService.create(data);
        success('New academic track initialized');
      }
      setIsFormModalOpen(false);
      fetchTracks(currentPage, debouncedSearch);
    } catch (err: any) {
      error(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTrack) return;

    try {
      setActionLoading(true);
      await tracksService.delete(selectedTrack.id);
      success('Academic track successfully de-commissioned');
      setIsDeleteDialogOpen(false);
      setSelectedTrack(null);
      fetchTracks(currentPage, debouncedSearch);
    } catch {
      error('Failed to revoke curricular deployment');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <RoleGuard requiredPermission={PERMISSIONS.VIEW_TRACKS}>
      <div className="space-y-12">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
              Curriculum Matrix
            </div>
            <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
              Academic <span className="font-black text-primary">Tracks</span>
            </h2>
            <p className="text-on-surface-variant text-base font-medium">
              Define, deploy, and manage specialized learning pathways within the educational infrastructure.
            </p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
          >
            <Plus className="w-4 h-4" />
            Initialize Track
          </button>
        </section>

        {/* Control Strip & Grid */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                placeholder="SEARCH CURRICULAR PATHWAYS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-4 border-l border-outline/30 hidden md:flex">
               <span>Active Matrix Nodes: {totalItems}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant animate-pulse">Syncing Curricular deployment Matrix...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tracks.length > 0 ? tracks.map((track) => (
                  <div 
                    key={track.id} 
                    className="bg-white rounded-[2rem] shadow-glass border border-outline/30 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col overflow-hidden cursor-pointer"
                    onClick={() => handleOpenView(track)}
                  >
                    <div className="p-8 space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                         <div className="p-3 rounded-2xl bg-surface border border-outline/50 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                           <GraduationCap className="w-6 h-6" />
                         </div>
                         <ArrowUpRight className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black tracking-tighter text-on-surface group-hover:text-primary transition-colors">{track.name}</h3>
                         <p className="text-xs text-on-surface-variant font-medium line-clamp-2 mt-2 leading-relaxed">
                           {track.description}
                         </p>
                      </div>
                    </div>
                    
                    <div className="px-8 py-6 bg-surface/50 border-t border-outline/20 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="flex flex-col">
                           <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Roster</span>
                           <span className="text-xs font-black text-on-surface">{track.students?.length || 0} Students</span>
                         </div>
                         <div className="h-8 w-[1px] bg-outline/30"></div>
                         <div className="flex flex-col">
                           <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Genesis</span>
                           <span className="text-xs font-black text-on-surface">{formatDate(track.createdAt)}</span>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleOpenEdit(e, track)}
                            className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                            title="Edit Parameters"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => openDeleteDialog(e, track)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="De-commission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-outline/30 shadow-glass">
                     <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-6" />
                     <h4 className="text-2xl font-black text-on-surface tracking-tighter mb-2">Registry is Empty</h4>
                     <p className="text-sm font-medium text-on-surface-variant max-w-sm mx-auto">No academic pathways have been initialized in the system. Start by provisioning a new track.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-glass border border-outline/30 mt-8">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                    Matrix Node {currentPage} of {totalPages} — Total Deployments: {totalItems}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="p-2 border border-outline/50 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-30 transition-all font-black uppercase text-[10px] px-4 flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous Node
                    </button>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="p-2 border border-outline/50 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-30 transition-all font-black uppercase text-[10px] px-4 flex items-center gap-2"
                    >
                      Next Node
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Curricular Pathway"
          subtitle="Academic Track Specifications"
          maxWidth="4xl"
        >
          {selectedTrack && <TrackDetails track={selectedTrack} />}
        </Modal>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={selectedTrack ? 'Modify Pathway' : 'Initialize Track'}
          subtitle={selectedTrack ? 'Update Curriculum Matrix' : 'New Academic Deployment'}
          maxWidth="2xl"
        >
          <TrackForm 
            isEdit={!!selectedTrack}
            isLoading={actionLoading}
            initialData={selectedTrack ? {
              name: selectedTrack.name,
              description: selectedTrack.description,
            } : undefined}
            onSubmit={handleFormSubmit}
          />
        </Modal>

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen && !!selectedTrack}
          title="De-commission Academic Track?"
          message={`Confirm de-commissioning of the ${selectedTrack?.name} curricular pathway. This action is logged in the educational audit trail.`}
          confirmText="Execute De-commission"
          cancelText="Cancel"
          loading={actionLoading}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!actionLoading) {
              setIsDeleteDialogOpen(false);
              setSelectedTrack(null);
            }
          }}
        />
      </div>
    </RoleGuard>
  );
}
