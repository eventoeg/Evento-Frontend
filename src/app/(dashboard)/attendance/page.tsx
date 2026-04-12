'use client';

import { useEffect, useState, useCallback } from 'react';
import { attendanceService } from '@/services/attendance.service';
import { eventsService } from '@/services/events.service';
import { usersService } from '@/services/users.service';
import { useToastStore } from '@/store/toast.store';
import SearchableSelect, { SearchableOption } from '@/components/ui/SearchableSelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Attendance, Event, User, UserRole } from '@/types';
import { 
  Loader2, 
  Search, 
  Plus, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
  Calendar,
  Clock,
  User as UserIcon,
  ShieldCheck,
  QrCode
} from 'lucide-react';

export default function AttendancePage() {
  const { success, error } = useToastStore();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Attendance | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    eventId: '',
    studentId: '',
  });

  const fetchData = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const [recordsRes, eventsRes, allUsers] = await Promise.all([
        attendanceService.findAll(page, 10),
        eventsService.findAll(1, 10),
        usersService.findAll(1, 10, UserRole.STUDENT)
      ]);

      if (recordsRes.success && recordsRes.data) {
        setRecords(recordsRes.data.items);
        setTotalPages(recordsRes.data.pagination.totalPages);
        setTotalItems(recordsRes.data.pagination.total);
      }

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data.items);
      }

      if (allUsers.success && allUsers.data) {
        setStudents(
          allUsers.data.items.filter(
            (user) => user.role === UserRole.STUDENT && !!user.student?.id,
          ),
        );
      }
    } catch {
      error('Failed to synchronize attendance logs');
    } finally {
      setLoading(false);
    }
  }, [error]);

  const searchEventOptions = useCallback(async (query: string): Promise<SearchableOption[]> => {
    const res = await eventsService.findAll(1, 10, query);
    if (!res.success || !res.data) return [];
    return res.data.items.map((event) => ({ value: event.id, label: event.title }));
  }, []);

  const searchStudentOptions = useCallback(async (query: string): Promise<SearchableOption[]> => {
    const res = await usersService.findAll(1, 10, UserRole.STUDENT, query);
    if (!res.success || !res.data) return [];

    return res.data.items
      .filter((user) => !!user.student?.id)
      .map((user) => ({
        value: user.student!.id,
        label: `${user.firstName} ${user.lastName} (${user.email})`,
      }));
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await attendanceService.checkIn(formData.eventId, formData.studentId);
      success('Attendance recorded successfully');
      setIsModalOpen(false);
      fetchData(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (record: Attendance) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    try {
      setDeleteLoading(true);
      await attendanceService.delete(recordToDelete.id);
      success('Attendance record voided');
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchData(currentPage);
    } catch {
      error('Failed to void attendance');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student?.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student?.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Security & Compliance
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            Event <span className="font-black text-primary">Attendance</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Monitor event entry, record student arrivals, and manage secure check-in protocols.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Manual Check-In
        </button>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center gap-6">
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
               <UserCheck className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Arrivals</p>
               <p className="text-2xl font-black text-on-surface">{totalItems}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center gap-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Verified Entries</p>
               <p className="text-2xl font-black text-on-surface">100%</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center gap-6">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
               <QrCode className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Digital Auth</p>
               <p className="text-2xl font-black text-on-surface">Enabled</p>
            </div>
         </div>
      </div>

      {/* Search & List */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH BY CANDIDATE OR EVENT..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {totalItems} Check-In Events Logged
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Retrieving Logs...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/50 border-b border-outline/30">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Arrival Entity</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Event Target</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Timeline</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-surface/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface border border-outline/50 text-primary flex items-center justify-center font-black">
                             <UserIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black tracking-tight">
                              {record.student?.user?.firstName} {record.student?.user?.lastName}
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">
                              REF: {record.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-sm text-on-surface font-black">
                           <Calendar className="w-4 h-4 text-on-surface-variant" />
                           {record.event?.title}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                          <Clock className="w-4 h-4" />
                          {new Date(record.checkInTime).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => openDeleteDialog(record)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Void Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-20 text-center">
                        <div className="text-sm font-medium text-on-surface-variant">No check-in events recorded today.</div>
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

      {/* Manual Check-In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="p-8 border-b border-outline/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-black tracking-tighter text-on-surface">
                  Manual <span className="text-primary text-2xl">Check-In</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">Attendance Override Form</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCheckIn} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Active Event</label>
                <SearchableSelect
                  options={events.map((e) => ({ value: e.id, label: e.title }))}
                  value={formData.eventId}
                  onChange={(eventId) => setFormData({ ...formData, eventId })}
                  onSearch={searchEventOptions}
                  initialVisibleCount={10}
                  placeholder="Select Event..."
                  searchPlaceholder="Search events..."
                  emptyText="No events found"
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Student Identity</label>
                <SearchableSelect
                  options={students.map((s) => ({
                    value: s.student!.id,
                    label: `${s.firstName} ${s.lastName} (${s.email})`,
                  }))}
                  value={formData.studentId}
                  onChange={(studentId) => setFormData({ ...formData, studentId })}
                  onSearch={searchStudentOptions}
                  initialVisibleCount={10}
                  placeholder="Select Student..."
                  searchPlaceholder="Search students..."
                  emptyText="No students found"
                  disabled={formLoading}
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
                  disabled={formLoading || !formData.eventId || !formData.studentId}
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Execute Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen && !!recordToDelete}
        title="Void attendance record?"
        message={`This will remove the check-in record for ${recordToDelete?.student?.user?.firstName || 'selected student'} ${recordToDelete?.student?.user?.lastName || ''}.`}
        confirmText="Void Record"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setIsDeleteDialogOpen(false);
            setRecordToDelete(null);
          }
        }}
      />
    </div>
  );
}
