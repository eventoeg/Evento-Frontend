import type { QueueStatus, InterviewResult, InterviewStatus } from '@/shared/types/enums';
import type { Student, JobProfile } from '@/types';

export interface QueueEntry {
  id: string;
  position: number;
  status: QueueStatus;
  student: Student;
  jobProfile: JobProfile;
  interview?: {
    id: string;
    interviewerName: string;
    startedAt: string | null;
    endedAt: string | null;
    status: InterviewStatus;
    result: InterviewResult;
    notes: string | null;
  } | null;
  _optimistic?: boolean;
  _serverVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueState {
  entriesById: Record<string, QueueEntry>;
  order: string[];
  activeInterviewId: string | null;
  syncState: 'idle' | 'syncing' | 'fallback-poll' | 'live';
}

export type QueueEvent =
  | { type: 'queueJoined'; payload: QueueEntry }
  | { type: 'queueUpdated'; payload: QueueEntry }
  | { type: 'interviewStarted'; payload: { queueId: string; interviewId: string } }
  | { type: 'interviewEnded'; payload: { queueId: string; interviewId: string; result: InterviewResult } };
