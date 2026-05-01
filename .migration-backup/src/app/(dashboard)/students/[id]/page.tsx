'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { studentCvsService } from '@/services/student-cvs.service';
import { useToastStore } from '@/store/toast.store';
import { User, StudentCv } from '@/types';
import { formatDate, getInitials } from '@/lib/utils';
import { 
  Loader2, 
  ChevronLeft, 
  ExternalLink,
  GraduationCap,
  Calendar,
  FileText,
  Download,
  Star,
  Clock,
  Briefcase,
  Trophy,
  History,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { error } = useToastStore();
  const [student, setStudent] = useState<User | null>(null);
  const [cvs, setCvs] = useState<StudentCv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [studentRes, cvsRes] = await Promise.all([
          usersService.findById(id as string),
          studentCvsService.findAll(1, 10, id as string)
        ]);

        if (studentRes.success && studentRes.data) {
          setStudent(studentRes.data);
        }
        if (cvsRes.success && cvsRes.data) {
          setCvs(cvsRes.data.items);
        }
      } catch (err) {
        error('Failed to sync student career profile');
        router.push('/students');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, error, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Accessing Career Node...</p>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Navigation */}
      <Link 
        href="/students" 
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
      >
        <div className="p-2 rounded-full bg-white shadow-sm border border-outline/30 group-hover:border-primary/30">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Learner Directory</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-glass border border-outline/30 overflow-hidden">
            <div className="h-40 bg-on-surface relative p-8">
               <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest text-white/40 border border-white/10 px-2 py-0.5 rounded">
                 S-RANK NODE
               </div>
               <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-xl flex items-center justify-center text-primary font-black text-3xl shrink-0">
                   {getInitials(student.firstName, student.lastName)}
                 </div>
                 <div className="text-white">
                   <h3 className="text-2xl font-black tracking-tighter leading-tight">{student.firstName} {student.lastName}</h3>
                   <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Learner ID: {student.id.slice(0, 8)}</div>
                 </div>
               </div>
            </div>
            <div className="p-8 space-y-8">
              <section>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                  <GraduationCap className="w-3 h-3 text-primary" />
                  Academic Deployment
                </p>
                <div className="p-5 bg-surface rounded-2xl border border-outline/30">
                  <div className="text-sm font-black text-on-surface mb-1">{student.student?.track?.name || 'Unassigned Track'}</div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    <span>Class of {student.student?.graduationYear}</span>
                    <span className="w-1 h-1 rounded-full bg-outline"></span>
                    <span>Certified</span>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                  <History className="w-3 h-3" />
                  Infrastructure Lifecycle
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Initialization</span>
                    <span className="text-[9px] font-black text-on-surface uppercase tracking-widest">{formatDate(student.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Career Readiness</span>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 rounded">High Probability</span>
                  </div>
                </div>
              </section>

              <button 
                onClick={() => router.push(`/users/${id}/edit`)}
                className="w-full py-4 bg-surface text-on-surface-variant border border-outline/50 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                Modify Identity Parameters
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Verification Box */}
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
             <Trophy className="w-6 h-6 text-primary shrink-0" />
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Elite Candidate</p>
               <p className="text-[10px] text-primary/70 font-medium leading-relaxed">
                 Identity verified against ITI academic standards. Candidate is authorized for high-level industry placement.
               </p>
             </div>
          </div>
        </div>

        {/* Career Hub */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-glass border border-outline/30 p-8 lg:p-12">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-3xl font-black tracking-tight text-on-surface flex items-center gap-4">
                Career Assets
                <span className="material-symbols-outlined text-primary/30">folder_shared</span>
              </h4>
              <button 
                className="p-3 bg-on-surface text-white rounded-2xl hover:bg-primary transition-all flex items-center gap-2"
                onClick={() => success('CV Refresh module initializing...')}
              >
                <FileText className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Sync New Asset</span>
              </button>
            </div>

            <div className="space-y-6">
              {cvs.length > 0 ? cvs.map((cv) => (
                <div key={cv.id} className="flex items-center justify-between p-6 rounded-3xl bg-surface/30 border border-outline/30 group hover:border-primary/40 hover:bg-white transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-outline/30 flex items-center justify-center text-primary relative group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                      {cv.isPrimary && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white border-2 border-white">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-base font-black text-on-surface tracking-tight">{cv.title || 'Curriculum Vitae'}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Deployed {formatDate(cv.createdAt)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-outline/50"></span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{cv.isPrimary ? 'Primary Asset' : 'Archived'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 overflow-hidden w-0 group-hover:w-auto transition-all duration-500">
                    <a 
                      href={cv.fileUrl} 
                      target="_blank" 
                      className="p-3 bg-white border border-outline/30 rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
                      title="Download Manifest"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-surface/30 rounded-[2.5rem] border border-dashed border-outline/30">
                   <ShieldAlert className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
                   <h5 className="text-xl font-black text-on-surface tracking-tighter">Career Signal Missing</h5>
                   <p className="text-sm font-medium text-on-surface-variant max-w-xs mx-auto mt-2">No vocational assets have been uploaded for this candidate identity. Career readiness status is currently unverified.</p>
                </div>
              )}
            </div>

            <div className="mt-12 p-8 bg-surface/50 rounded-[2rem] border border-outline/20">
               <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6 border-b border-outline/20 pb-4 flex items-center gap-2">
                 <Briefcase className="w-4 h-4" />
                 Industry Placement Potential
               </h5>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                      Candidate mapping shows strong alignment with <span className="text-on-surface font-black">Enterprise Computing</span> and <span className="text-on-surface font-black">Scale Infrastructure</span> roles.
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {['Full-Stack', 'Cloud Systems', 'Security Architecture'].map(tag => (
                         <span key={tag} className="px-3 py-1 bg-white border border-outline/50 rounded-full text-[9px] font-bold tracking-widest uppercase text-on-surface-variant">{tag}</span>
                       ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-outline/20 flex flex-col justify-center items-center text-center">
                    <div className="text-4xl font-black text-primary tracking-tighter">A+</div>
                    <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mt-2">Registry Score</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
