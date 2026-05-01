
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { jobProfilesService } from '@/services/job-profiles.service';
import { brandingSpeakersService } from '@/services/branding-speakers.service';
import { eventsService } from '@/services/events.service';
import { useAuthStore } from '@/store/auth.store';
import { useToastStore } from '@/store/toast.store';
import { JobProfile, BrandingSpeaker, Event, EventType, InterviewType, CreateJobProfileDto, CreateBrandingSpeakerDto } from '@/types';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/types';
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  X,
  Briefcase,
  Calendar,
  Users,
  Target,
  CheckCircle,
  Clock,
  Building2,
  Mic,
  Megaphone,
} from 'lucide-react';

export default function CompanyDashboardPage() {
  return (
    <RoleGuard requiredRole={UserRole.COMPANY_REP} fallback={<AccessDenied />}>
      <CompanyDashboardContent />
    </RoleGuard>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600 mb-2">Access Denied</p>
        <p className="text-slate-600">This page is only accessible to company representatives.</p>
      </div>
    </div>
  );
}

function CompanyDashboardContent() {
  const [, navigate] = useLocation();
  const { user } = useAuthStore();
  const { success, error } = useToastStore();
  const [activeTab, setActiveTab] = useState<'profiles' | 'branding'>('profiles');
  
  // Job Profiles state
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [jobFairEvents, setJobFairEvents] = useState<Event[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<JobProfile | null>(null);
  const [profileFormLoading, setProfileFormLoading] = useState(false);
  const [profileFormData, setProfileFormData] = useState<CreateJobProfileDto>({
    jobTitle: '',
    jobDescription: '',
    requiredPositions: 1,
    interviewType: InterviewType.HR,
    companyId: user?.company?.id || '',
    eventId: '',
  });

  // Branding Speakers state
  const [speakers, setSpeakers] = useState<BrandingSpeaker[]>([]);
  const [speakersLoading, setSpeakersLoading] = useState(true);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<BrandingSpeaker | null>(null);
  const [speakerFormLoading, setSpeakerFormLoading] = useState(false);
  const [speakerFormData, setSpeakerFormData] = useState<CreateBrandingSpeakerDto>({
    speakerName: '',
    speakerTitle: '',
    sessionDetails: '',
    companyId: user?.company?.id || '',
    eventId: '',
  });
  const [wantsBrandingDay, setWantsBrandingDay] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    if (!user?.company?.id) return;

    try {
      setProfilesLoading(true);
      setSpeakersLoading(true);

      const [profilesRes, speakersRes, eventsRes] = await Promise.allSettled([
        jobProfilesService.findAll(1, 100, undefined, user.company!.id),
        brandingSpeakersService.findAll(1, 100, undefined, user.company!.id),
        eventsService.findAll(1, 100, EventType.JOB_FAIR),
      ]);

      if (profilesRes.status === 'fulfilled' && profilesRes.value.success && profilesRes.value.data) {
        setJobProfiles(profilesRes.value.data.items);
      }

      if (speakersRes.status === 'fulfilled' && speakersRes.value.success && speakersRes.value.data) {
        setSpeakers(speakersRes.value.data.items);
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value.success && eventsRes.value.data) {
        setJobFairEvents(eventsRes.value.data.items);
      }
    } catch (err) {
      error('Failed to load company dashboard data');
    } finally {
      setProfilesLoading(false);
      setSpeakersLoading(false);
    }
  }, [user, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check if company wants branding day
  useEffect(() => {
    setWantsBrandingDay(speakers.length > 0);
  }, [speakers]);

  // Job Profile handlers
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileFormLoading(true);
      if (selectedProfile) {
        await jobProfilesService.update(selectedProfile.id, profileFormData);
        success('Job profile updated successfully');
      } else {
        await jobProfilesService.create(profileFormData);
        success('Job profile created successfully');
      }
      setIsProfileModalOpen(false);
      setSelectedProfile(null);
      setProfileFormData({
        jobTitle: '',
        jobDescription: '',
        requiredPositions: 1,
        interviewType: InterviewType.HR,
        companyId: user?.company?.id || '',
        eventId: '',
      });
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save job profile');
    } finally {
      setProfileFormLoading(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await jobProfilesService.delete(id);
      success('Job profile deleted');
      loadData();
    } catch {
      error('Failed to delete job profile');
    }
  };

  // Speaker handlers
  const handleSpeakerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSpeakerFormLoading(true);
      if (selectedSpeaker) {
        await brandingSpeakersService.update(selectedSpeaker.id, speakerFormData);
        success('Speaker updated successfully');
      } else {
        await brandingSpeakersService.create(speakerFormData);
        success('Speaker created successfully');
      }
      setIsSpeakerModalOpen(false);
      setSelectedSpeaker(null);
      setSpeakerFormData({
        speakerName: '',
        speakerTitle: '',
        sessionDetails: '',
        companyId: user?.company?.id || '',
        eventId: '',
      });
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save speaker');
    } finally {
      setSpeakerFormLoading(false);
    }
  };

  const handleDeleteSpeaker = async (id: string) => {
    try {
      await brandingSpeakersService.delete(id);
      success('Speaker deleted');
      loadData();
    } catch {
      error('Failed to delete speaker');
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
          Company Portal
        </div>
        <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
          Job Fair <span className="font-black text-primary">Dashboard</span>
        </h2>
        <p className="text-on-surface-variant text-base font-medium">
          Manage your job profiles, branding speakers, and interview queue configuration.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline/30">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'profiles'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Profiles ({jobProfiles.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'branding'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Branding Day ({speakers.length})
          </div>
        </button>
      </div>

      {/* Job Profiles Tab */}
      {activeTab === 'profiles' && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-on-surface">Job Profiles</h3>
              <p className="text-sm text-on-surface-variant">Define positions, interview types, and headcount.</p>
            </div>
            <button
              onClick={() => {
                setSelectedProfile(null);
                setProfileFormData({
                  jobTitle: '',
                  jobDescription: '',
                  requiredPositions: 1,
                  interviewType: InterviewType.HR,
                  companyId: user?.company?.id || '',
                  eventId: jobFairEvents[0]?.id || '',
                });
                setIsProfileModalOpen(true);
              }}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Profile
            </button>
          </div>

          {profilesLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : jobProfiles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-outline/30 shadow-glass p-12 text-center">
              <Briefcase className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
              <p className="text-sm font-medium text-on-surface-variant">No job profiles yet. Create your first one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobProfiles.map((profile) => (
                <div key={profile.id} className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedProfile(profile);
                          setProfileFormData({
                            jobTitle: profile.jobTitle,
                            jobDescription: profile.jobDescription,
                            requiredPositions: profile.requiredPositions,
                            interviewType: profile.interviewType,
                            companyId: profile.company?.id || '',
                            eventId: profile.event?.id || '',
                          });
                          setIsProfileModalOpen(true);
                        }}
                        className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-lg font-black text-on-surface mb-2">{profile.jobTitle}</h4>
                  <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{profile.jobDescription}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-on-surface-variant">
                        <Target className="w-4 h-4" />
                        Interview Type
                      </span>
                      <span className="font-bold text-on-surface uppercase">{profile.interviewType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-on-surface-variant">
                        <Users className="w-4 h-4" />
                        Positions
                      </span>
                      <span className="font-bold text-on-surface">{profile.requiredPositions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-on-surface-variant">
                        <Calendar className="w-4 h-4" />
                        Event
                      </span>
                      <span className="font-bold text-on-surface truncate max-w-[120px]">{profile.event?.title || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-on-surface-variant">
                        <CheckCircle className="w-4 h-4" />
                        Status
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                        profile.isApproved
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {profile.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Branding Day Tab */}
      {activeTab === 'branding' && (
        <section className="space-y-6">
          {!wantsBrandingDay ? (
            <div className="bg-white rounded-2xl border border-outline/30 shadow-glass p-12 text-center">
              <Megaphone className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
              <h3 className="text-xl font-bold text-on-surface mb-2">Request a Branding Day</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Branding days let you showcase your company with speaker sessions and presentations.
              </p>
              <button
                onClick={() => setWantsBrandingDay(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                Request Branding Day
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-on-surface">Branding Day Speakers</h3>
                  <p className="text-sm text-on-surface-variant">Add speakers and session details for your branding day.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSpeaker(null);
                    setSpeakerFormData({
                      speakerName: '',
                      speakerTitle: '',
                      sessionDetails: '',
                      companyId: user?.company?.id || '',
                      eventId: jobFairEvents[0]?.id || '',
                    });
                    setIsSpeakerModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Speaker
                </button>
              </div>

              {speakersLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : speakers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-outline/30 shadow-glass p-12 text-center">
                  <Mic className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                  <p className="text-sm font-medium text-on-surface-variant">No speakers added yet. Add your first speaker to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {speakers.map((speaker) => (
                    <div key={speaker.id} className="bg-white p-6 rounded-2xl shadow-glass border border-outline/30 group hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Mic className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedSpeaker(speaker);
                              setSpeakerFormData({
                                speakerName: speaker.speakerName,
                                speakerTitle: speaker.speakerTitle,
                                sessionDetails: speaker.sessionDetails,
                                companyId: speaker.company?.id || '',
                                eventId: speaker.event?.id || '',
                              });
                              setIsSpeakerModalOpen(true);
                            }}
                            className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSpeaker(speaker.id)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-lg font-black text-on-surface mb-1">{speaker.speakerName}</h4>
                      <p className="text-sm text-primary font-medium mb-2">{speaker.speakerTitle}</p>
                      <p className="text-sm text-on-surface-variant line-clamp-2">{speaker.sessionDetails}</p>

                      <div className="mt-4 pt-4 border-t border-outline/20 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <Calendar className="w-4 h-4" />
                          {speaker.event?.title || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Job Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-black tracking-tighter text-on-surface">
                {selectedProfile ? 'Update' : 'Create'} <span className="text-primary">Job Profile</span>
              </h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Job Title
                </label>
                <input
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                  placeholder="e.g. Senior Software Engineer"
                  value={profileFormData.jobTitle}
                  onChange={(e) => setProfileFormData({ ...profileFormData, jobTitle: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                    Interview Type
                  </label>
                  <select
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                    value={profileFormData.interviewType}
                    onChange={(e) => setProfileFormData({ ...profileFormData, interviewType: e.target.value as InterviewType })}
                  >
                    {Object.values(InterviewType).map((type) => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                    Required Positions
                  </label>
                  <input
                    required
                    min={1}
                    type="number"
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                    value={profileFormData.requiredPositions}
                    onChange={(e) => setProfileFormData({ ...profileFormData, requiredPositions: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Linked Event
                </label>
                <select
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none"
                  value={profileFormData.eventId}
                  onChange={(e) => setProfileFormData({ ...profileFormData, eventId: e.target.value })}
                >
                  <option value="">Select an event...</option>
                  {jobFairEvents.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Job Description
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={profileFormData.jobDescription}
                  onChange={(e) => setProfileFormData({ ...profileFormData, jobDescription: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 border border-outline text-on-surface-variant py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={profileFormLoading}
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  {profileFormLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {selectedProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Speaker Modal */}
      {isSpeakerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsSpeakerModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-black tracking-tighter text-on-surface">
                {selectedSpeaker ? 'Update' : 'Add'} <span className="text-primary">Speaker</span>
              </h3>
              <button onClick={() => setIsSpeakerModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSpeakerSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Speaker Name
                </label>
                <input
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                  placeholder="e.g. Dr. Jane Smith"
                  value={speakerFormData.speakerName}
                  onChange={(e) => setSpeakerFormData({ ...speakerFormData, speakerName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Speaker Title
                </label>
                <input
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                  placeholder="e.g., Chief Technology Officer"
                  value={speakerFormData.speakerTitle}
                  onChange={(e) => setSpeakerFormData({ ...speakerFormData, speakerTitle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Session Details
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none"
                  placeholder="Describe the session topic, format, and duration..."
                  value={speakerFormData.sessionDetails}
                  onChange={(e) => setSpeakerFormData({ ...speakerFormData, sessionDetails: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                  Linked Event
                </label>
                <select
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none"
                  value={speakerFormData.eventId}
                  onChange={(e) => setSpeakerFormData({ ...speakerFormData, eventId: e.target.value })}
                >
                  <option value="">Select an event...</option>
                  {jobFairEvents.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsSpeakerModalOpen(false)}
                  className="flex-1 border border-outline text-on-surface-variant py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={speakerFormLoading}
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  {speakerFormLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {selectedSpeaker ? 'Update Speaker' : 'Add Speaker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
