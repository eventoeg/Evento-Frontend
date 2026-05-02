import type { QueueEntry } from '../model/queue.types';

export function reconcile(
  stored: Record<string, QueueEntry>,
  snapshot: QueueEntry[],
): QueueEntry[] {
  const result: QueueEntry[] = [];
  for (const entry of snapshot) {
    const local = stored[entry.id];
    // Prefer server version unless we have a newer optimistic update
    if (local?._optimistic && (local._serverVersion ?? 0) > (entry._serverVersion ?? 0)) {
      result.push(local);
    } else {
      result.push(entry);
    }
  }
  return result;
}
