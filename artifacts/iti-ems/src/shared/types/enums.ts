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
