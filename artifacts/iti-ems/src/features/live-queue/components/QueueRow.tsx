import type { QueueEntry } from '../model/queue.types';
import { getStatusColor } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface QueueRowProps {
  entry: QueueEntry;
  isActive: boolean;
  onSkip: (id: string) => void;
  onHalt: (id: string) => void;
  onResume: (id: string) => void;
  onStart: (id: string) => void;
  isLeader: boolean;
}

export function QueueRow({ entry, isActive, onSkip, onHalt, onResume, onStart, isLeader }: QueueRowProps) {
  const student = entry.student;
  const user = student?.user;
  const name = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  const initials = user ? getInitials(user.firstName, user.lastName) : '?';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
        isActive
          ? 'border-primary bg-primary/5'
          : entry._optimistic
          ? 'border-yellow-200 bg-yellow-50 opacity-80'
          : 'border-outline bg-white'
      }`}
    >
      <span className="w-8 text-center text-sm font-semibold text-on-surface-variant">
        #{entry.position}
      </span>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{name}</p>
        <p className="text-xs text-on-surface-variant truncate">{user?.email ?? ''}</p>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(entry.status)}`}>
        {entry.status.replace('_', ' ')}
      </span>
      {isLeader && (
        <div className="flex items-center gap-1">
          {entry.status === 'waiting' && (
            <>
              <button
                onClick={() => onStart(entry.id)}
                className="rounded px-2 py-1 text-xs bg-primary text-white hover:bg-primary/90 transition-colors"
                title="Start (S)"
              >
                Start
              </button>
              <button
                onClick={() => onSkip(entry.id)}
                className="rounded px-2 py-1 text-xs bg-outline text-on-surface hover:bg-outline/60 transition-colors"
                title="Skip (K)"
              >
                Skip
              </button>
              <button
                onClick={() => onHalt(entry.id)}
                className="rounded px-2 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                Halt
              </button>
            </>
          )}
          {entry.status === 'halted' && (
            <button
              onClick={() => onResume(entry.id)}
              className="rounded px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              Resume
            </button>
          )}
        </div>
      )}
    </div>
  );
}
