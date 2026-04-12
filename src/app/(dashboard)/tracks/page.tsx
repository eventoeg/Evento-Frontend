'use client';

import { useEffect, useState, useCallback } from 'react';
import { tracksService } from '@/services/tracks.service';
import { useToastStore } from '@/store/toast.store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Track, CreateTrackDto } from '@/types';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  X,
  Users
} from 'lucide-react';

export default function TracksPage() {
  const { success, error } = useToastStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateTrackDto>({
    name: '',
    description: '',
  });

  const fetchTracks = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await tracksService.findAll(page, 10);
      if (res.success && res.data) {
        setTracks(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to load academic tracks');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchTracks(currentPage);
  }, [currentPage, fetchTracks]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (selectedTrack) {
        await tracksService.update(selectedTrack.id, formData);
        success('Track updated successfully');
      } else {
        await tracksService.create(formData);
        success('Track created successfully');
      }
      setIsModalOpen(false);
      fetchTracks(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save track');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (track: Track) => {
    setTrackToDelete(track);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!trackToDelete) return;

    try {
      setDeleteLoading(true);
      await tracksService.delete(trackToDelete.id);
      success('Track deleted successfully');
      setIsDeleteDialogOpen(false);
      setTrackToDelete(null);
      fetchTracks(currentPage);
    } catch {
      error('Failed to delete track');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openModal = (track: Track | null = null) => {
    if (track) {
      setSelectedTrack(track);
      setFormData({
        name: track.name,
        description: track.description,
      });
    } else {
      setSelectedTrack(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const filteredTracks = tracks.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Academic Infrastructure
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            Academic <span className="font-black text-primary">Tracks</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Define and manage the educational pathways for ITI students and curriculum streams.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Create New Track
        </button>
      </section>

      {/* Search & List */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH TRACKS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {totalItems} Active Pathways Identified
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white h-64 rounded-2xl shadow-glass border border-outline/30 animate-pulse"></div>
            ))
          ) : filteredTracks.length > 0 ? filteredTracks.map((track) => (
            <div key={track.id} className="bg-white p-8 rounded-2xl shadow-glass border border-outline/30 group hover:border-primary/30 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => openModal(track)}
                    className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openDeleteDialog(track)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="text-xl font-black tracking-tighter text-on-surface group-hover:text-primary transition-colors">{track.name}</h4>
                <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1 mb-4">ID: {track.id.slice(0, 8)}</p>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed line-clamp-3">
                  {track.description}
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-outline/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  <Users className="w-4 h-4" />
                  <span>Enrolled Students</span>
                </div>
                <div className="text-lg font-black text-on-surface">
                  {/* Since students are often lazy-loaded, we might not have a count here unless the API provides it. 
                      Based on service, findById returns students. For list, we'll show a placeholder or 0 */}
                  {track.students?.length || 0}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-outline/30 shadow-glass">
              <div className="text-sm font-medium text-on-surface-variant">No academic tracks found in the system.</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems} tracks
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
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="p-8 border-b border-outline/30 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tighter text-on-surface">
                  {selectedTrack ? 'Edit' : 'Create'} <span className="text-primary text-2xl">Track</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">Infrastructure Definition Form</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Track Designation</label>
                <input 
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                  placeholder="e.g. Software Engineering v3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  type="text"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Curriculum Definition</label>
                <textarea 
                  required
                  rows={6}
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none" 
                  placeholder="Describe the scope, technologies, and objectives of this academic stream..."
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
                  {selectedTrack ? 'Update Pathway' : 'Commit Infrastructure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen && !!trackToDelete}
        title="Delete this academic track?"
        message={`This will delete ${trackToDelete?.name || 'the selected track'} and may affect linked students.`}
        confirmText="Delete Track"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setIsDeleteDialogOpen(false);
            setTrackToDelete(null);
          }
        }}
      />
    </div>
  );
}
