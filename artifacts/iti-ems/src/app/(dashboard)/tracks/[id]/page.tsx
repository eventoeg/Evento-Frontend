
import { useParams, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { tracksService } from '@/services/tracks.service';
import { useToastStore } from '@/store/toast.store';
import { Track, User } from '@/types';
import { formatDate, getInitials } from '@/lib/utils';
import { 
  Loader2, 
  ChevronLeft, 
  Edit2, 
  Trash2, 
  GraduationCap, 
  Calendar,
  Users as UsersIcon,
  BookOpen,
  Mail,
  ExternalLink,
  Search,
  School
} from 'lucide-react';
import { Link } from 'wouter';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function TrackDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { error, success } = useToastStore();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function fetchTrack() {
      try {
        setLoading(true);
        const res = await tracksService.findById(id as string);
        if (res.success && res.data) {
          setTrack(res.data);
        } else {
          error('Academic pathway not found');
          navigate('/tracks');
        }
      } catch (err) {
        error('Failed to access curricular deployment node');
        navigate('/tracks');
      } finally {
        setLoading(false);
      }
    }
    fetchTrack();
  }, [id, error, navigate]);

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await tracksService.delete(id as string);
      success('Academic pathway successfully de-commissioned');
      navigate('/tracks');
    } catch {
      error('Failed to revoke curricular deployment');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Syncing Curricular Matrix...</p>
      </div>
    );
  }

  if (!track) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link 
          href="/tracks" 
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
        >
          <div className="p-2 rounded-full bg-white shadow-sm border border-outline/30 group-hover:border-primary/30">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Curriculum Index</span>
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-6 py-3 border border-outline hover:border-primary/30 hover:bg-primary/5 text-on-surface-variant hover:text-primary rounded-xl transition-all group"
          >
            <Trash2 className="w-4 h-4 group-hover:shake" />
            <span className="text-[10px] font-black uppercase tracking-widest">De-commission Track</span>
          </button>
          <Link 
            href={`/tracks/${id}/edit`}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Update Specs</span>
          </Link>
        </div>
      </div>

      {/* Header Section */}
      <section className="relative overflow-hidden bg-on-surface p-8 lg:p-16 rounded-[2.5rem] text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
            <BookOpen className="w-3 h-3 text-primary" />
            Deployed Pathway
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter leading-tight">
            {track.name}
          </h2>
          <p className="text-lg text-white/70 font-medium leading-relaxed">
            {track.description}
          </p>
          <div className="flex flex-wrap items-center gap-8 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Authorized Pool</p>
                <p className="text-xl font-black">{track.students?.length || 0} Students</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Genesis Date</p>
                <p className="text-xl font-black">{formatDate(track.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Roster */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h3 className="text-2xl font-black tracking-tighter text-on-surface flex items-center gap-3">
               Track Roster
               <span className="material-symbols-outlined text-primary/30">verified</span>
             </h3>
             <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Academic Participants</p>
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input 
              className="w-64 bg-white border border-outline/50 rounded-full pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-primary transition-all outline-none" 
              placeholder="SEARCH ROSTER..." 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {track.students && track.students.length > 0 ? (
            track.students.map((student: any) => (
              <div 
                key={student.id} 
                className="bg-white p-6 rounded-[2rem] shadow-glass border border-outline/30 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-surface border border-outline/50 flex items-center justify-center font-black text-primary text-sm group-hover:scale-110 transition-transform">
                      {getInitials(student.user?.firstName || '', student.user?.lastName || '')}
                    </div>
                    <div>
                      <div className="text-base font-black tracking-tight text-on-surface">{student.user?.firstName} {student.user?.lastName}</div>
                      <div className="text-[10px] text-on-surface-variant font-medium lowercase flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {student.user?.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-surface rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Graduation</span>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary px-2 py-0.5 rounded-full border border-primary/10">Class of {student.graduationYear}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Profile Status</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-on-surface">Synchronized</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-outline/20 flex items-center justify-between">
                   <Link 
                    href={`/students/${student.user?.id}`}
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
                   >
                     Launch Student Node
                     <ExternalLink className="w-3 h-3" />
                   </Link>
                   <Link 
                    href={`/users/${student.user?.id}`}
                    className="p-2 border border-outline/30 rounded-full hover:bg-primary/5 hover:text-primary transition-all"
                   >
                     <UsersIcon className="w-4 h-4" />
                   </Link>
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full py-24 text-center bg-surface/30 rounded-[3rem] border border-dashed border-outline/30">
                <School className="w-12 h-12 text-primary/20 mx-auto mb-6" />
                <h4 className="text-xl font-black text-on-surface tracking-tighter mb-2">Academic Void Detected</h4>
                <p className="text-sm font-medium text-on-surface-variant max-w-sm mx-auto">No students are currently associated with this curricular pathway. Provision new students to populate the roster.</p>
                <Link 
                  href="/users/new?role=student"
                  className="mt-8 inline-flex items-center gap-2 bg-on-surface text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all"
                >
                  Register First Student
                </Link>
             </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="De-commission Academic Track?"
        message={`Warning: This will dissolve the curricular pathway for ${track.name}. This is a non-destructive action in terms of user data, but graduation associations will be severed.`}
        confirmText="Execute De-commission"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
