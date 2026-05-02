import { useState } from 'react';
import type { QueueEntry } from '../model/queue.types';
import { InterviewResult } from '@/shared/types/enums';
import { getInitials } from '@/lib/utils';

interface ActivePanelProps {
  entry: QueueEntry | null;
  onEnd: (interviewId: string, result: InterviewResult, notes?: string) => void;
  isLeader: boolean;
}

export function ActivePanel({ entry, onEnd, isLeader }: ActivePanelProps) {
  const [result, setResult] = useState<InterviewResult>(InterviewResult.PENDING);
  const [notes, setNotes] = useState('');

  if (!entry || !entry.interview) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-3">
        <span className="material-symbols-outlined text-5xl">person_search</span>
        <p className="text-sm font-medium">No active interview</p>
        <p className="text-xs text-center">Start an interview from the queue to see the candidate here.</p>
      </div>
    );
  }

  const student = entry.student;
  const user = student?.user;
  const name = user ? `${user.firstName} ${user.lastName}` : 'Candidate';

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3 pb-4 border-b border-outline">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
          {user ? getInitials(user.firstName, user.lastName) : '?'}
        </div>
        <div>
          <p className="font-semibold text-on-surface">{name}</p>
          <p className="text-sm text-on-surface-variant">{user?.email}</p>
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-outline bg-surface p-4">
        <p className="text-xs font-medium text-on-surface-variant mb-1">CV Preview</p>
        <div className="flex items-center justify-center h-40 bg-outline/20 rounded text-sm text-on-surface-variant">
          {student?.cvs?.[0]?.fileUrl ? (
            <iframe
              src={student.cvs[0].fileUrl}
              title="CV"
              className="w-full h-64 rounded"
              sandbox="allow-same-origin"
            />
          ) : (
            <span>No CV uploaded</span>
          )}
        </div>
      </div>

      {isLeader && (
        <div className="flex flex-col gap-3 border-t border-outline pt-4">
          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">Result</label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as InterviewResult)}
              className="w-full rounded border border-outline px-3 py-2 text-sm bg-white"
            >
              {Object.values(InterviewResult).map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-on-surface-variant block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border border-outline px-3 py-2 text-sm resize-none"
              rows={3}
              placeholder="Optional notes…"
            />
          </div>
          <button
            onClick={() => entry.interview && onEnd(entry.interview.id, result, notes)}
            className="w-full rounded-lg bg-primary text-white py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            End Interview (E)
          </button>
        </div>
      )}
    </div>
  );
}
