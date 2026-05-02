import { useEffect, useCallback } from 'react';
import { useQueueLive } from '@/features/live-queue/hooks/useQueueLive';
import { useInterviewSession } from '@/features/live-queue/hooks/useInterviewSession';
import { useTabLeader } from '@/features/live-queue/hooks/useTabLeader';
import { QueueList } from '@/features/live-queue/components/QueueList';
import { ActivePanel } from '@/features/live-queue/components/ActivePanel';
import { SyncBadge } from '@/features/live-queue/components/SyncBadge';
import { FallbackBanner } from '@/features/live-queue/components/FallbackBanner';
import { useAuthStore } from '@/store/auth.store';
import { wsClient } from '@/shared/ws/ws-client';
import type { InterviewResult } from '@/shared/types/enums';

interface InterviewerConsoleProps {
  jobProfileId: string;
}

export function InterviewerConsole({ jobProfileId }: InterviewerConsoleProps) {
  const { accessToken } = useAuthStore();
  const isLeader = useTabLeader(jobProfileId);
  const store = useQueueLive(jobProfileId);
  const { skip, halt, resume, startInterview, endInterview } = useInterviewSession(jobProfileId);

  const state = store((s) => s);
  const entries = state.order.map((id) => state.entriesById[id]).filter(Boolean);
  const activeEntry = state.activeInterviewId
    ? entries.find((e) => e.interview?.id === state.activeInterviewId) ?? null
    : null;

  // Connect WS with current access token
  useEffect(() => {
    if (accessToken) wsClient.connect(accessToken);
  }, [accessToken]);

  // Keyboard shortcuts (leader only)
  useEffect(() => {
    if (!isLeader) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const first = entries.find((en) => en.status === 'waiting');
      if (!first) return;
      if (e.key === 's' || e.key === 'S') startInterview(first.id, 'Interviewer');
      if ((e.key === 'k' || e.key === 'K') && activeEntry) skip(activeEntry.id);
      if ((e.key === 'e' || e.key === 'E') && activeEntry?.interview) {
        endInterview(activeEntry.interview.id, 'pending' as InterviewResult);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLeader, entries, activeEntry, skip, startInterview, endInterview]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Live Interview Console</h1>
        <div className="flex items-center gap-3">
          <SyncBadge state={state.syncState} />
          {!isLeader && (
            <span className="text-xs text-on-surface-variant bg-outline/40 px-2 py-1 rounded-full">
              Read-only (another tab is leading)
            </span>
          )}
        </div>
      </div>

      <FallbackBanner visible={state.syncState === 'fallback-poll'} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
            Queue ({entries.length})
          </p>
          <QueueList
            entries={entries}
            activeInterviewId={state.activeInterviewId}
            onSkip={skip}
            onHalt={halt}
            onResume={resume}
            onStart={(id) => startInterview(id, 'Interviewer')}
            isLeader={isLeader}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
            Active Interview
          </p>
          <div className="flex-1 rounded-xl border border-outline bg-white p-4">
            <ActivePanel
              entry={activeEntry}
              onEnd={endInterview}
              isLeader={isLeader}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
