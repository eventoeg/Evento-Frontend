type BroadcastMessage = { type: string; [k: string]: unknown };

export function createQueueBroadcast(jobProfileId: string) {
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(`queue:${jobProfileId}`);
  } catch {}

  return {
    send(msg: BroadcastMessage) {
      try {
        channel?.postMessage(msg);
      } catch {}
    },
    onMessage(fn: (msg: BroadcastMessage) => void) {
      if (channel) {
        channel.onmessage = (e) => fn(e.data as BroadcastMessage);
      }
    },
    close() {
      channel?.close();
    },
  };
}
