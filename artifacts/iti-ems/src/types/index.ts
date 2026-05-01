// ========================================
// Enums - Mirror backend enums exactly
// ========================================

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  STUDENT = 'student',
  SECURITY = 'security',
  COMPANY_REP = 'company_rep',
}

export enum CompanyStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export enum StudentStatus {
  CURRENT = 'current',
  ALUMNI = 'alumni',
}

export enum EventType {
  INTERNAL = 'internal',
  EXTERNAL_HOSTED = 'external_hosted',
  JOB_FAIR = 'job_fair',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum AgendaItemType {
  SESSION = 'session',
  BREAK = 'break',
  BRANDING_DAY = 'branding_day',
}

export enum CompanyInvitationStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

export enum InterviewType {
  HR = 'hr',
  TECHNICAL = 'technical',
  BOTH = 'both',
}

export enum QueueStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  SKIPPED = 'skipped',
  HALTED = 'halted',
  COMPLETED = 'completed',
}

export enum InterviewResult {
  PENDING = 'pending',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  PASSED = 'passed',
  FAILED = 'failed',
  HIRED = 'hired',
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum FeedbackTargetType {
  EVENT = 'event',
  COMPANY = 'company',
  INTERVIEW = 'interview',
}

// ========================================
// Core Entity Interfaces
// ========================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  company?: Company | null;
  student?: Student | null;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  companyName: string;
  location: string;
  description: string;
  status: CompanyStatus;
  users?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  graduationYear: number | null;
  status: StudentStatus;
  track: Track;
  user?: User | null;
  cvs?: StudentCv[];
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  students?: Student[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentCv {
  id: string;
  fileUrl: string;
  title: string;
  isPrimary: boolean;
  student: Student;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  eventType: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  description: string;
  venues?: EventVenue[];
  agendas?: EventAgenda[];
  createdAt: string;
  updatedAt: string;
}

export interface EventVenue {
  id: string;
  venueName: string;
  capacity: number;
  eventId?: string;
}

export interface EventAgenda {
  id: string;
  agendaItemType: AgendaItemType;
  startTime: string;
  endTime: string;
  details: string;
  eventId?: string;
}

export interface CompanyInvitation {
  id: string;
  invitationToken: string;
  status: CompanyInvitationStatus;
  company: Company;
  event: Event;
  createdAt: string;
  updatedAt: string;
}

export interface JobProfile {
  id: string;
  jobTitle: string;
  jobDescription: string;
  requiredPositions: number;
  interviewType: InterviewType;
  isApproved: boolean;
  company: Company;
  event: Event;
  interviewQueues?: InterviewQueue[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandingSpeaker {
  id: string;
  speakerName: string;
  speakerTitle: string;
  sessionDetails: string;
  company: Company;
  event: Event;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQueue {
  id: string;
  position: number;
  status: QueueStatus;
  jobProfile: JobProfile;
  student: Student;
  interview?: Interview | null;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  interviewerName: string;
  startedAt: string | null;
  endedAt: string | null;
  status: InterviewStatus;
  result: InterviewResult;
  notes: string | null;
  queue: InterviewQueue;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  event: Event;
  student: Student;
  checkInTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  targetType: FeedbackTargetType;
  eventId?: string;
  companyId?: string;
  interviewId?: string;
  rating: number;
  comments?: string;
  isMandatory?: boolean;
  student?: Student;
  event?: Event;
  company?: Company;
  interview?: Interview;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// DTO Interfaces (Request Bodies)
// ========================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  trackId?: string;
  companyId?: string;
  graduationYear?: number;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  trackId?: string;
  companyId?: string;
  graduationYear?: number;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  trackId?: string | null;
  companyId?: string | null;
  graduationYear?: number | null;
}

export interface CreateCompanyDto {
  companyName: string;
  location: string;
  description: string;
  status?: CompanyStatus;
}

export interface UpdateCompanyDto {
  companyName?: string;
  location?: string;
  description?: string;
  status?: CompanyStatus;
}

export interface CreateTrackDto {
  name: string;
  description: string;
}

export interface UpdateTrackDto {
  name?: string;
  description?: string;
}

export interface CreateEventDto {
  title: string;
  eventType: EventType;
  status: EventStatus;
  description: string;
  startDate: string;
  endDate: string;
  venues?: CreateVenueDto[];
  agendas?: CreateAgendaDto[];
}

export interface CreateVenueDto {
  venueName: string;
  capacity: number;
}

export interface CreateAgendaDto {
  itemType: AgendaItemType;
  startTime: string;
  endTime: string;
  details: string;
}

export interface UpdateEventDto {
  title?: string;
  eventType?: EventType;
  status?: EventStatus;
  description?: string;
  startDate?: string;
  endDate?: string;
  venues?: CreateVenueDto[];
  agendas?: CreateAgendaDto[];
}

export interface CreateCompanyInvitationDto {
  companyId: string;
  eventId: string;
}

export interface UpdateCompanyInvitationDto {
  companyId?: string;
  eventId?: string;
  status?: CompanyInvitationStatus;
}

export interface CreateJobProfileDto {
  jobTitle: string;
  jobDescription: string;
  requiredPositions: number;
  interviewType: InterviewType;
  companyId: string;
  eventId: string;
}

export interface UpdateJobProfileDto {
  jobTitle?: string;
  jobDescription?: string;
  requiredPositions?: number;
  interviewType?: InterviewType;
  companyId?: string;
  eventId?: string;
}

export interface CreateBrandingSpeakerDto {
  speakerName: string;
  speakerTitle: string;
  sessionDetails: string;
  companyId: string;
  eventId: string;
}

export interface UpdateBrandingSpeakerDto {
  speakerName?: string;
  speakerTitle?: string;
  sessionDetails?: string;
  companyId?: string;
  eventId?: string;
}

export interface CreateQueueEntryDto {
  jobProfileId: string;
  studentId: string;
}

export interface UpdateQueueStatusDto {
  status: QueueStatus;
}

export interface CreateInterviewDto {
  queueId: string;
  interviewerName: string;
}

export interface UpdateInterviewDto {
  status?: InterviewStatus;
  result?: InterviewResult;
  notes?: string;
}

export interface CreateAttendanceDto {
  eventId: string;
  studentId: string;
}

export interface CreateFeedbackDto {
  targetType: FeedbackTargetType;
  eventId?: string;
  companyId?: string;
  interviewId?: string;
  rating: number;
  comments?: string;
  isMandatory?: boolean;
}

export interface UpdateFeedbackDto {
  rating?: number;
  comments?: string;
  isMandatory?: boolean;
}

// ========================================
// API Response Envelope
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string | string[];
  path: string;
  data: T | null;
  pagination: PaginationMetadata | null;
  errors: string[] | null;
  timestamp: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

// ========================================
// Auth-Specific Types
// ========================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshDto {
  refreshToken: string;
}
