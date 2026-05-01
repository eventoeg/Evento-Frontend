
import { useEffect, useState, useCallback } from 'react';
import { interviewsService } from '@/services/interviews.service';
import { useToastStore } from '@/store/toast.store';
import { Interview, UpdateInterviewDto, InterviewStatus, InterviewResult } from '@/types';
import { 
  Loader2, 
  Search, 
  Edit2, 
  ChevronLeft,
  ChevronRight,
  X,
  Video,
  User,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function InterviewsPage() {
  const { success, error } = useToastStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState<UpdateInterviewDto>({
    status: InterviewStatus.COMPLETED,
    result: InterviewResult.PENDING,
    notes: '',
  });

  const fetchInterviews = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await interviewsService.findAll(page, 10);
      if (res.success && res.data) {
        setInterviews(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to synchronize interview logs');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchInterviews(currentPage);
  }, [currentPage, fetchInterviews]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setFormLoading(true);
      await interviewsService.update(selectedInterview.id, formData);
      success('Interview record updated successfully');
      setIsModalOpen(false);
      fetchInterviews(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update interview');
    } finally {
      setFormLoading(false);
    }
  };

  const openModal = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormData({
      status: interview.status,
      result: interview.result,
      notes: interview.notes || '',
    });
    setIsModalOpen(true);
  };

  const filteredInterviews = interviews.filter(i => 
    i.queue?.student?.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.queue?.student?.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.queue?.jobProfile?.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Assessment Intelligence
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            Interview <span className="font-black text-primary">Logistics</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Monitor interview statuses, record assessment results, and archive evaluator feedback.
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
              placeholder="SEARCH BY CANDIDATE OR PROFILE..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {totalItems} Assessment Records Identified
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Accessing Assessment Data...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/50 border-b border-outline/30">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Candidate</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Job Profile</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Outcome</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {filteredInterviews.length > 0 ? filteredInterviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-surface/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface border border-outline/50 text-primary flex items-center justify-center font-black">
                             <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black tracking-tight">
                              {interview.queue?.student?.user?.firstName} {interview.queue?.student?.user?.lastName}
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-mono uppercase mt-1 flex items-center gap-1">
                              REF: {interview.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <div className="text-sm text-on-surface font-black truncate max-w-[200px]">{interview.queue?.jobProfile?.jobTitle}</div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                            <Briefcase className="w-3 h-3" />
                            {interview.queue?.jobProfile?.company?.companyName}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <StatusBadge status={interview.status} />
                      </td>
                      <td className="p-6">
                        <ResultBadge result={interview.result} />
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => openModal(interview)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Review & Update"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="text-sm font-medium text-on-surface-variant">No assessment logs match the current criteria.</div>
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

      {/* Review Modal */}
      {isModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-outline/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-black tracking-tighter text-on-surface">
                  Review <span className="text-primary text-2xl">Assessment</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">Interview Evaluation Record</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-8">
              {/* Context Header */}
              <div className="bg-surface p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-outline/30">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary">
                      <User className="w-6 h-6" />
                   </div>
                   <div>
                        <p className="text-sm font-black text-on-surface">
                        {selectedInterview.queue?.student?.user?.firstName} {selectedInterview.queue?.student?.user?.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
                        Candidate Profile
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary">
                      <Briefcase className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-sm font-black text-on-surface">
                        {selectedInterview.queue?.jobProfile?.jobTitle}
                      </p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
                        {selectedInterview.queue?.jobProfile?.company?.companyName}
                      </p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Workflow State</label>
                  <select 
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InterviewStatus })}
                  >
                    {Object.values(InterviewStatus).map((status) => (
                      <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Assessment Result</label>
                  <select 
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value as InterviewResult })}
                  >
                    {Object.values(InterviewResult).map((result) => (
                      <option key={result} value={result}>{result.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Evaluator Feedback & Notes</label>
                <textarea 
                  rows={6}
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none" 
                  placeholder="Record interview observations, technical performance, and final recommendation..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Archive Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status?: InterviewStatus | string | null }) {
  let styles = "";
  let dotColor = "bg-slate-500";
  switch (status) {
    case InterviewStatus.COMPLETED:
      styles = "bg-emerald-50 text-emerald-600 border-emerald-100";
      dotColor = "bg-emerald-600";
      break;
    case InterviewStatus.IN_PROGRESS:
      styles = "bg-sky-50 text-sky-600 border-sky-100";
      dotColor = "bg-sky-600";
      break;
    case InterviewStatus.SCHEDULED:
      styles = "bg-amber-50 text-amber-600 border-amber-100";
      dotColor = "bg-amber-600";
      break;
    case InterviewStatus.CANCELLED:
      styles = "bg-primary/5 text-primary border-primary/10";
      dotColor = "bg-primary";
      break;
    default:
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      dotColor = "bg-slate-600";
      break;
  }

  const safeStatusLabel =
    typeof status === 'string' && status.length > 0
      ? status.replace(/_/g, ' ')
      : 'UNKNOWN';

  return (
    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded border flex items-center gap-1.5 w-fit ${styles}`}>
      <span className={`w-1 h-1 rounded-full ${dotColor}`}></span>
      {safeStatusLabel}
    </span>
  );
}

function ResultBadge({ result }: { result?: InterviewResult | string | null }) {
  let styles = "";
  switch (result) {
    case InterviewResult.HIRED:
      styles = "bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20";
      break;
    case InterviewResult.REJECTED:
      styles = "bg-primary text-white border-primary/80 shadow-sm shadow-primary/20";
      break;
    case InterviewResult.SHORTLISTED:
      styles = "bg-violet-500 text-white border-violet-600 shadow-sm shadow-violet-500/20";
      break;
    case InterviewResult.PENDING:
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      break;
    default:
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      break;
  }

  const safeResultLabel =
    typeof result === 'string' && result.length > 0
      ? result.replace(/_/g, ' ')
      : 'PENDING';

  return (
    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded border flex items-center gap-1.5 w-fit ${styles}`}>
      {result === InterviewResult.HIRED && <CheckCircle className="w-2.5 h-2.5" />}
      {result === InterviewResult.REJECTED && <XCircle className="w-2.5 h-2.5" />}
      {result === InterviewResult.PENDING && <AlertCircle className="w-2.5 h-2.5" />}
      {safeResultLabel}
    </span>
  );
}
