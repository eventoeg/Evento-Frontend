import type { QueueState } from '../model/queue.types';

interface SyncBadgeProps {
  state: QueueState['syncState'];
}

const labels: Record<QueueState['syncState'], string> = {
  idle: 'Idle',
  syncing: 'Syncing…',
  'fallback-poll': 'Polling (offline)',
  live: 'Live',
};

const colors: Record<QueueState['syncState'], string> = {
  idle: 'bg-gray-100 text-gray-600',
  syncing: 'bg-yellow-100 text-yellow-700',
  'fallback-poll': 'bg-orange-100 text-orange-700',
  live: 'bg-green-100 text-green-700',
};

export function SyncBadge({ state }: SyncBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[state]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${state === 'live' ? 'bg-green-500 animate-pulse' : state === 'fallback-poll' ? 'bg-orange-500' : 'bg-gray-400'}`}
      />
      {labels[state]}
    </span>
  );
}
