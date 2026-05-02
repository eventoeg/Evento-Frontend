import { useCallback } from 'react';
import { getQueueStore } from '../store/queue.store';
import { queuesApi } from '../api/queues.api';
import { useToastStore } from '@/store/toast.store';
import type { InterviewResult } from '@/shared/types/enums';
import type { QueueEntry } from '../model/queue.types';

function uuid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function useInterviewSession(jobProfileId: string) {
  const store = getQueueStore(jobProfileId);
  const toast = useToastStore.getState();

  const skip = useCallback(async (queueId: string) => {
    const original = store.getState().entriesById[queueId];
    if (!original) return;
    const key = uuid();
    store.getState().optimisticUpdate(queueId, { status: 'skipped' as QueueEntry['status'] });
    try {
      await queuesApi.skip(queueId, key);
    } catch {
      store.getState().rollback(queueId, original);
      toast.error('Failed to skip — reverted.');
    }
  }, [jobProfileId, store]);

  const halt = useCallback(async (queueId: string) => {
    const original = store.getState().entriesById[queueId];
    if (!original) return;
    store.getState().optimisticUpdate(queueId, { status: 'halted' as QueueEntry['status'] });
    try {
      await queuesApi.halt(queueId);
    } catch {
      store.getState().rollback(queueId, original);
      toast.error('Failed to halt — reverted.');
    }
  }, [jobProfileId, store]);

  const resume = useCallback(async (queueId: string) => {
    const original = store.getState().entriesById[queueId];
    if (!original) return;
    store.getState().optimisticUpdate(queueId, { status: 'waiting' as QueueEntry['status'] });
    try {
      await queuesApi.resume(queueId);
    } catch {
      store.getState().rollback(queueId, original);
      toast.error('Failed to resume — reverted.');
    }
  }, [jobProfileId, store]);

  const startInterview = useCallback(async (queueId: string, interviewerName: string) => {
    try {
      const res = await queuesApi.startInterview(queueId, interviewerName);
      if (res.data?.success && res.data.data) {
        store.getState().setActiveInterview(res.data.data.interview?.id ?? null);
        toast.success('Interview started');
      }
    } catch {
      toast.error('Failed to start interview');
    }
  }, [jobProfileId, store]);

  const endInterview = useCallback(async (interviewId: string, result: InterviewResult, notes?: string) => {
    try {
      await queuesApi.endInterview(interviewId, result, notes);
      store.getState().setActiveInterview(null);
      toast.success('Interview ended');
    } catch {
      toast.error('Failed to end interview');
    }
  }, [jobProfileId, store]);

  return { skip, halt, resume, startInterview, endInterview };
}
