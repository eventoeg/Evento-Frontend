
import { useEffect, useState, useCallback } from 'react';
import { studentCvsService } from '@/services/student-cvs.service';
import { useToastStore } from '@/store/toast.store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { StudentCv } from '@/types';
import { 
  Loader2, 
  Search, 
  Plus, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Download,
  Eye,
  User,
  Calendar
} from 'lucide-react';

export default function StudentCvsPage() {
  const { success, error } = useToastStore();
  const [cvs, setCvs] = useState<StudentCv[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<StudentCv | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCvs = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await studentCvsService.findAll(page, 10);
      if (res.success && res.data) {
        setCvs(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to load CV repository');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchCvs(currentPage);
  }, [currentPage, fetchCvs]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    try {
      setUploadLoading(true);
      await studentCvsService.upload(uploadFile, uploadTitle);
      success('CV uploaded successfully');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      fetchCvs(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to upload CV');
    } finally {
      setUploadLoading(false);
    }
  };

  const openDeleteDialog = (cv: StudentCv) => {
    setCvToDelete(cv);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!cvToDelete) return;

    try {
      setDeleteLoading(true);
      await studentCvsService.delete(cvToDelete.id);
      success('CV removed successfully');
      setIsDeleteDialogOpen(false);
      setCvToDelete(null);
      fetchCvs(currentPage);
    } catch {
      error('Failed to remove CV');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCvs = cvs.filter(cv => 
    cv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cv.student?.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cv.student?.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Talent Documentation
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            Student <span className="font-black text-primary">CVs</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Centralized repository for student resumes and professional profiles.
          </p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Upload New CV
        </button>
      </section>

      {/* Search & List */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH BY STUDENT OR TITLE..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {totalItems} Documents in Repository
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Retrieving Documents...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/50 border-b border-outline/30">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Document</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Student</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Upload Date</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {filteredCvs.length > 0 ? filteredCvs.map((cv) => (
                    <tr key={cv.id} className="hover:bg-surface/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface border border-outline/50 text-primary flex items-center justify-center font-black">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black tracking-tight">{cv.title || 'Untitled Resume'}</div>
                            <div className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">REF: {cv.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-sm text-on-surface font-medium">
                          <User className="w-4 h-4 text-on-surface-variant" />
                          {cv.student?.user?.firstName} {cv.student?.user?.lastName}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                          <Calendar className="w-4 h-4" />
                          {new Date(cv.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`http://localhost:3000${cv.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="View / Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => openDeleteDialog(cv)}
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
                      <td colSpan={4} className="p-20 text-center">
                        <div className="text-sm font-medium text-on-surface-variant">No CV records identified.</div>
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

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="p-8 border-b border-outline/30 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tighter text-on-surface">
                  Upload <span className="text-primary text-2xl">New CV</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">Documentation Submission</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Document Title</label>
                <input 
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                  placeholder="e.g. Software Engineer Resume 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">PDF Document</label>
                <div className="relative group">
                  <input 
                    required
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full bg-surface border-2 border-dashed border-outline/50 rounded-xl py-12 px-4 text-center cursor-pointer hover:border-primary/50 transition-all"
                    type="file"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <FileText className="w-8 h-8 text-on-surface-variant mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface">
                      {uploadFile ? uploadFile.name : 'Select or Drop PDF File'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 border border-outline text-on-surface-variant py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={uploadLoading || !uploadFile}
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  {uploadLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Commit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen && !!cvToDelete}
        title="Delete this CV record?"
        message={`This will remove ${cvToDelete?.title || 'the selected CV'} from the repository.`}
        confirmText="Delete CV"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setIsDeleteDialogOpen(false);
            setCvToDelete(null);
          }
        }}
      />
    </div>
  );
}
