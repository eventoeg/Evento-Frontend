'use client';

import { useEffect, useState, useCallback } from 'react';
import { eventsService } from '@/services/events.service';
import { useToastStore } from '@/store/toast.store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Event, CreateEventDto, EventType, EventStatus } from '@/types';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  MapPin,
  Clock,
  Tag
} from 'lucide-react';

export default function EventsPage() {
  const { success, error } = useToastStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    eventType: EventType.JOB_FAIR,
    startDate: '',
    endDate: '',
    status: EventStatus.DRAFT,
  });

  const fetchEvents = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await eventsService.findAll(page, 10);
      if (res.success && res.data) {
        setEvents(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to load events registry');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, fetchEvents]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (selectedEvent) {
        await eventsService.update(selectedEvent.id, formData);
        success('Event updated successfully');
      } else {
        await eventsService.create(formData);
        success('Event created successfully');
      }
      setIsModalOpen(false);
      fetchEvents(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      setDeleteLoading(true);
      await eventsService.delete(eventToDelete.id);
      success('Event deleted successfully');
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
      fetchEvents(currentPage);
    } catch {
      error('Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openModal = (event: Event | null = null) => {
    if (event) {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        status: event.status,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
      });
    } else {
      setSelectedEvent(null);
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData({
        title: '',
        description: '',
        eventType: EventType.JOB_FAIR,
        status: EventStatus.DRAFT,
        startDate: now.toISOString().slice(0, 16),
        endDate: inOneHour.toISOString().slice(0, 16),
      });
    }
    setIsModalOpen(true);
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Operational Calendar
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            System <span className="font-black text-primary">Events</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Schedule and manage recruitment fairs, technical workshops, and branding sessions.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Schedule Event
        </button>
      </section>

      {/* Search & List */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH EVENTS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {totalItems} Scheduled Operations
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white h-48 rounded-2xl shadow-glass border border-outline/30 animate-pulse"></div>
            ))
          ) : filteredEvents.length > 0 ? filteredEvents.map((event) => (
            <div key={event.id} className="bg-white p-8 rounded-2xl shadow-glass border border-outline/30 group hover:border-primary/30 transition-all flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center justify-center bg-surface rounded-xl p-4 min-w-[100px] h-fit border border-outline/20">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                  {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-3xl font-black text-on-surface">
                  {new Date(event.startDate).getDate()}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">
                  {new Date(event.startDate).getFullYear()}
                </span>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black tracking-tighter text-on-surface group-hover:text-primary transition-colors">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                         event.eventType === EventType.JOB_FAIR ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                         event.eventType === EventType.INTERNAL ? 'bg-sky-50 text-sky-600 border-sky-100' :
                         'bg-violet-50 text-violet-600 border-violet-100'
                       }`}>
                         {event.eventType.replace('_', ' ')}
                       </span>
                       <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                         <Clock className="w-3 h-3" />
                         {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => openModal(event)}
                      className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openDeleteDialog(event)}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed line-clamp-2">
                  {event.description}
                </p>
                
                <div className="pt-4 border-t border-outline/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Main Auditorium / Virtual</span>
                  </div>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                    Manage Logistics
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-outline/30 shadow-glass">
              <div className="text-sm font-medium text-on-surface-variant">No events scheduled in the pipeline.</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems} events
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
                  {selectedEvent ? 'Edit' : 'Schedule'} <span className="text-primary text-2xl">Event</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">Calendar Definition Form</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Event Title</label>
                <input 
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                  placeholder="e.g. Annual Job Fair 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  type="text"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Event Category</label>
                  <select 
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                     value={formData.eventType}
                     onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                  >
                    {Object.values(EventType).map((type) => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                   {/* Placeholder for venue or other metadata */}
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Visibility</label>
                   <div className="flex items-center gap-2 py-3.5">
                        <input
                          type="checkbox"
                          checked={formData.status === EventStatus.PUBLISHED}
                          onChange={(e) => setFormData({ ...formData, status: e.target.checked ? EventStatus.PUBLISHED : EventStatus.DRAFT })}
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                        />
                      <span className="text-xs font-bold uppercase tracking-widest text-on-surface">Published</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Start Timeline</label>
                  <input 
                    required
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">End Timeline</label>
                  <input 
                    required
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    type="datetime-local"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Event Abstract</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none" 
                  placeholder="Summarize the event goals and scheduled activities..."
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
                  {selectedEvent ? 'Update Schedule' : 'Commit to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen && !!eventToDelete}
        title="Delete this event?"
        message={`This will remove ${eventToDelete?.title || 'the selected event'} from the calendar.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setIsDeleteDialogOpen(false);
            setEventToDelete(null);
          }
        }}
      />
    </div>
  );
}
