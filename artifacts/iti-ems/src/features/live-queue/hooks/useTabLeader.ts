import { useState, useEffect, useRef } from 'react';

export function useTabLeader(resourceId: string): boolean {
  const [isLeader, setIsLeader] = useState(false);
  const lockRef = useRef<Lock | null>(null);

  useEffect(() => {
    if (!navigator?.locks) {
      // Web Locks API not supported — fall back to being leader
      setIsLeader(true);
      return;
    }

    const lockName = `queue-leader:${resourceId}`;
    let released = false;

    navigator.locks.request(
      lockName,
      { mode: 'exclusive', ifAvailable: true },
      async (lock) => {
        if (lock === null) {
          // Another tab holds the lock
          setIsLeader(false);
          return;
        }
        lockRef.current = lock;
        setIsLeader(true);
        // Hold the lock until this tab unmounts
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (released) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      },
    );

    return () => {
      released = true;
      setIsLeader(false);
    };
  }, [resourceId]);

  return isLeader;
}
