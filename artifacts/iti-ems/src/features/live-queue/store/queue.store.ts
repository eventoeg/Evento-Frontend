import { create } from 'zustand';
import type { QueueEntry, QueueState } from '../model/queue.types';
import type { QueueStatus } from '@/shared/types/enums';

interface QueueStore extends QueueState {
  hydrate: (entries: QueueEntry[]) => void;
  applyDelta: (entry: QueueEntry) => void;
  setActiveInterview: (interviewId: string | null) => void;
  setSyncState: (s: QueueState['syncState']) => void;
  optimisticUpdate: (id: string, patch: Partial<QueueEntry>) => void;
  rollback: (id: string, original: QueueEntry) => void;
  dispose: () => void;
}

export function createQueueStore(jobProfileId: string) {
  return create<QueueStore>((set, get) => ({
    entriesById: {},
    order: [],
    activeInterviewId: null,
    syncState: 'idle',

    hydrate: (entries) => {
      const entriesById: Record<string, QueueEntry> = {};
      const order: string[] = [];
      const sorted = [...entries].sort((a, b) => a.position - b.position);
      for (const e of sorted) {
        entriesById[e.id] = e;
        order.push(e.id);
      }
      set({ entriesById, order, syncState: 'live' });
    },

    applyDelta: (entry) => {
      set((s) => {
        const existing = s.entriesById[entry.id];
        // Reject stale deltas
        if (existing?._serverVersion !== undefined && (entry._serverVersion ?? 0) <= existing._serverVersion) {
          return s;
        }
        const entriesById = { ...s.entriesById, [entry.id]: entry };
        const order = s.order.includes(entry.id)
          ? [...s.order].sort((a, b) => (entriesById[a]?.position ?? 0) - (entriesById[b]?.position ?? 0))
          : [...s.order, entry.id].sort((a, b) => (entriesById[a]?.position ?? 0) - (entriesById[b]?.position ?? 0));
        return { entriesById, order };
      });
    },

    setActiveInterview: (interviewId) => set({ activeInterviewId: interviewId }),

    setSyncState: (syncState) => set({ syncState }),

    optimisticUpdate: (id, patch) => {
      set((s) => ({
        entriesById: {
          ...s.entriesById,
          [id]: { ...s.entriesById[id], ...patch, _optimistic: true },
        },
      }));
    },

    rollback: (id, original) => {
      set((s) => ({
        entriesById: { ...s.entriesById, [id]: original },
      }));
    },

    dispose: () => {
      set({ entriesById: {}, order: [], activeInterviewId: null, syncState: 'idle' });
    },
  }));
}

// Per-jobProfile store registry
const registry = new Map<string, ReturnType<typeof createQueueStore>>();

export function getQueueStore(jobProfileId: string) {
  if (!registry.has(jobProfileId)) {
    registry.set(jobProfileId, createQueueStore(jobProfileId));
  }
  return registry.get(jobProfileId)!;
}

export function disposeQueueStore(jobProfileId: string) {
  const store = registry.get(jobProfileId);
  if (store) {
    store.getState().dispose();
    registry.delete(jobProfileId);
  }
}
