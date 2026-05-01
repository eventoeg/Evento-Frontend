
import { useEffect, useState, useCallback } from 'react';
import { feedbackService } from '@/services/feedback.service';
import { useToastStore } from '@/store/toast.store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Feedback, FeedbackTargetType } from '@/types';
import { 
  Loader2, 
  Search, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  MessageSquare,
  User,
  Calendar,
  Building2,
  Video,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function FeedbackPage() {
  const { success, error } = useToastStore();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFeedback = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await feedbackService.findAll(page, 10);
      if (res.success && res.data) {
        setFeedback(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to synchronize feedback repository');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchFeedback(currentPage);
  }, [currentPage, fetchFeedback]);

  const openDeleteDialog = (entry: Feedback) => {
    setFeedbackToDelete(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!feedbackToDelete) return;

    try {
      setDeleteLoading(true);
      await feedbackService.delete(feedbackToDelete.id);
      success('Feedback entry purged');
      setIsDeleteDialogOpen(false);
      setFeedbackToDelete(null);
      fetchFeedback(currentPage);
    } catch {
      error('Failed to purge feedback');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(f => 
    f.comments?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.student?.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.student?.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Experience Analytics
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            Stakeholder <span className="font-black text-primary">Feedback</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Analyze student experience, partner satisfaction, and interview quality across the system.
          </p>
        </div>
      </section>

      {/* Search & List */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH BY CANDIDATE OR CONTENT..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {totalItems} Satisfaction Records Identified
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white h-48 rounded-2xl shadow-glass border border-outline/30 animate-pulse"></div>
            ))
          ) : filteredFeedback.length > 0 ? filteredFeedback.map((entry) => (
            <div key={entry.id} className="bg-white p-8 rounded-2xl shadow-glass border border-outline/30 group hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <User className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black tracking-tighter text-on-surface">
                        {entry.student?.user?.firstName} {entry.student?.user?.lastName}
                      </h4>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < entry.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                   </div>
                   <button 
                    onClick={() => openDeleteDialog(entry)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                     entry.targetType === FeedbackTargetType.EVENT ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                     entry.targetType === FeedbackTargetType.COMPANY ? 'bg-sky-50 text-sky-600 border-sky-100' :
                     'bg-violet-50 text-violet-600 border-violet-100'
                   }`}>
                     {entry.targetType} Target
                   </span>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-on-surface uppercase tracking-widest">
                      {entry.targetType === FeedbackTargetType.EVENT ? <Calendar className="w-3 h-3" /> :
                       entry.targetType === FeedbackTargetType.COMPANY ? <Building2 className="w-3 h-3" /> :
                       <Video className="w-3 h-3" />}
                      {entry.event?.title || entry.company?.companyName || entry.interview?.queue?.jobProfile?.jobTitle || 'Unknown Entity'}
                   </div>
                </div>

                <p className="text-sm text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-outline/30 pl-4 py-1">
                  "{entry.comments || 'No written feedback provided.'}"
                </p>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-outline/30 shadow-glass">
              <div className="text-sm font-medium text-on-surface-variant">No satisfaction metrics identified in the logs.</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center justify-between">
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
      </section>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen && !!feedbackToDelete}
        title="Purge this feedback entry?"
        message="This will permanently remove the selected feedback record."
        confirmText="Purge Entry"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setIsDeleteDialogOpen(false);
            setFeedbackToDelete(null);
          }
        }}
      />
    </div>
  );
}
