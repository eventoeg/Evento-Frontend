import { QueueRow } from './QueueRow';
import type { QueueEntry } from '../model/queue.types';

interface QueueListProps {
  entries: QueueEntry[];
  activeInterviewId: string | null;
  onSkip: (id: string) => void;
  onHalt: (id: string) => void;
  onResume: (id: string) => void;
  onStart: (id: string) => void;
  isLeader: boolean;
}

export function QueueList({ entries, activeInterviewId, onSkip, onHalt, onResume, onStart, isLeader }: QueueListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-2">queue</span>
        <p className="text-sm">No entries in queue</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      {entries.map((entry) => (
        <QueueRow
          key={entry.id}
          entry={entry}
          isActive={entry.interview?.id === activeInterviewId}
          onSkip={onSkip}
          onHalt={onHalt}
          onResume={onResume}
          onStart={onStart}
          isLeader={isLeader}
        />
      ))}
    </div>
  );
}
