'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/users.service';
import { useToastStore } from '@/store/toast.store';
import { User, UserRole } from '@/types';
import { getInitials, formatDate } from '@/lib/utils';
import { 
  Loader2, 
  Search, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Mail,
  Eye,
  FileText,
  User as UserIcon,
  BadgeCheck,
  TrendingUp
} from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const { success, error } = useToastStore();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchStudents = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      const res = await usersService.findAll(
        page,
        10,
        UserRole.STUDENT,
        search,
      );

      if (res.success && res.data) {
        setStudents(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to load student directory');
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
    fetchStudents(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchStudents]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Academic Operations
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            Student <span className="font-black text-primary">Directory</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Access and manage the global student roster. Monitor academic progress, career readiness, and graduation status.
          </p>
        </div>
        <Link 
          href="/users/new?role=student"
          className="flex items-center gap-2 bg-on-surface text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-primary transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Register Student
        </Link>
      </section>

      {/* Stats Quick View */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center gap-5">
           <div className="p-3 bg-primary/5 rounded-xl text-primary">
             <UserIcon className="w-6 h-6" />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Active Learners</p>
             <p className="text-2xl font-black text-on-surface">{totalItems}</p>
           </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center gap-5">
           <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
             <BadgeCheck className="w-6 h-6" />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Graduation Ready</p>
             <p className="text-2xl font-black text-on-surface">{Math.floor(totalItems * 0.85)}</p>
           </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center gap-5">
           <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
             <TrendingUp className="w-6 h-6" />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Placement Rate</p>
             <p className="text-2xl font-black text-on-surface">92%</p>
           </div>
         </div>
      </section>

      {/* Directory Content */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH STUDENT POOL..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="flex items-center gap-4 px-4 bg-surface rounded-full py-2">
             <Filter className="w-3 h-3 text-on-surface-variant" />
             <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Global Sync: Online</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Synchronizing Learner Directory...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/50 border-b border-outline/30">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Student Identity</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Deployment Track</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Class</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Career Hub</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {students.length > 0 ? students.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-surface/30 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/students/${student.id}`)}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface border border-outline/50 text-primary flex items-center justify-center font-black text-xs">
                            {getInitials(student.firstName, student.lastName)}
                          </div>
                          <div>
                            <div className="text-sm font-black tracking-tight">{student.firstName} {student.lastName}</div>
                            <div className="text-[10px] text-on-surface-variant font-medium lowercase flex items-center gap-1 mt-1">
                              <Mail className="w-3 h-3" />
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-on-surface-variant" />
                          <span className="text-sm font-medium text-on-surface">
                            {student.student?.track?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-[10px] font-black text-on-surface uppercase tracking-widest bg-surface px-2.5 py-1 rounded w-fit border border-outline/30">
                          {student.student?.graduationYear || 'N/A'}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <FileText className="w-4 h-4 opacity-50" />
                          <span className="text-[10px] font-black uppercase tracking-widest">CV Active</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/students/${student.id}`}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            onClick={(e) => e.stopPropagation()}
                            title="Student Node"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link 
                            href={`/users/${student.id}/edit`}
                            className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                            onClick={(e) => e.stopPropagation()}
                            title="Identity Root"
                          >
                            <UserIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="text-sm font-medium text-on-surface-variant italic">No learners found in the directory.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-outline/30 flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                    Node Pool Statistics: {totalItems} Active Identities
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
                      Node {currentPage} / {totalPages}
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
    </div>
  );
}

// Fixed missing filter import
import { Filter } from 'lucide-react';
