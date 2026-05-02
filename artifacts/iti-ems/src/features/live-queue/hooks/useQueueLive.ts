import { useEffect, useRef, useCallback } from 'react';
import { wsClient } from '@/shared/ws/ws-client';
import { getQueueStore, disposeQueueStore } from '../store/queue.store';
import { queuesApi } from '../api/queues.api';
import { reconcile } from '../lib/reconcile';
import type { QueueEntry } from '../model/queue.types';

const FALLBACK_INTERVAL_MS = 3000;
const WS_CONNECT_TIMEOUT_MS = 5000;

export function useQueueLive(jobProfileId: string) {
  const store = getQueueStore(jobProfileId);
  const { hydrate, applyDelta, setSyncState } = store.getState();
  const fallbackTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectCount = useRef(0);
  const disconnectWindow = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await queuesApi.getByJobProfile(jobProfileId);
      if (res.data?.success && res.data.data) {
        const entries = res.data.data.items;
        const current = store.getState().entriesById;
        hydrate(reconcile(current, entries));
      }
    } catch {}
  }, [jobProfileId, hydrate, store]);

  const startFallbackPoll = useCallback(() => {
    setSyncState('fallback-poll');
    if (!fallbackTimer.current) {
      fallbackTimer.current = setInterval(fetchSnapshot, FALLBACK_INTERVAL_MS);
    }
  }, [fetchSnapshot, setSyncState]);

  const stopFallbackPoll = useCallback(() => {
    if (fallbackTimer.current) {
      clearInterval(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  }, []);

  useEffect(() => {
    setSyncState('syncing');

    // Initial snapshot
    fetchSnapshot();

    // WS connect timeout → fallback
    wsTimeoutRef.current = setTimeout(() => {
      if (!wsClient.isConnected()) startFallbackPoll();
    }, WS_CONNECT_TIMEOUT_MS);

    const room = `jobProfile:${jobProfileId}`;
    wsClient.joinRoom(room);

    const handleDelta = (data: unknown) => {
      applyDelta(data as QueueEntry);
    };

    wsClient.on('queueJoined', handleDelta);
    wsClient.on('queueUpdated', handleDelta);

    wsClient.on('connect', () => {
      if (wsTimeoutRef.current) clearTimeout(wsTimeoutRef.current);
      stopFallbackPoll();
      setSyncState('live');
      fetchSnapshot(); // reconcile on reconnect
    });

    wsClient.on('disconnect', () => {
      disconnectCount.current += 1;
      if (!disconnectWindow.current) {
        disconnectWindow.current = setTimeout(() => {
          disconnectCount.current = 0;
          disconnectWindow.current = null;
        }, 60_000);
      }
      if (disconnectCount.current >= 3) {
        startFallbackPoll();
      }
    });

    return () => {
      wsClient.leaveRoom(room);
      wsClient.off('queueJoined', handleDelta);
      wsClient.off('queueUpdated', handleDelta);
      stopFallbackPoll();
      if (wsTimeoutRef.current) clearTimeout(wsTimeoutRef.current);
      disposeQueueStore(jobProfileId);
    };
  }, [jobProfileId]);

  return store;
}
