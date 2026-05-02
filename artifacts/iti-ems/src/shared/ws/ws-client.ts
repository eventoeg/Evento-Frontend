import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/shared/lib/env';

type Listener = (data: unknown) => void;
type EventMap = Record<string, Set<Listener>>;

let socket: Socket | null = null;
let connectToken: string | null = null;
const listeners: EventMap = {};
const rooms = new Set<string>();

function getSocket(): Socket {
  if (socket) return socket;

  const base = API_BASE_URL.replace(/\/api$/, '');

  socket = io(base, {
    auth: { token: connectToken },
    transports: ['websocket'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    reconnectionAttempts: Infinity,
  });

  socket.on('connect', () => {
    rooms.forEach((room) => socket?.emit('joinRoom', room));
  });

  socket.on('connect_error', (err) => {
    if ((err as { message: string }).message === 'unauthorized') {
      // Token may have rotated — update auth payload and reconnect
      if (socket) {
        (socket.auth as Record<string, unknown>).token = connectToken;
        socket.connect();
      }
    }
  });

  socket.onAny((event: string, data: unknown) => {
    const subs = listeners[event];
    if (subs) subs.forEach((fn) => fn(data));
  });

  // Heartbeat every 20 s
  setInterval(() => {
    socket?.emit('ping');
  }, 20_000);

  // Listen for auth token rotations from other tabs / api-client
  try {
    const bc = new BroadcastChannel('auth');
    bc.onmessage = (e) => {
      if (e.data?.type === 'token_refreshed') {
        connectToken = e.data.accessToken;
        if (socket) {
          (socket.auth as Record<string, unknown>).token = connectToken;
        }
      }
    };
  } catch {}

  return socket;
}

export const wsClient = {
  connect(token: string) {
    connectToken = token;
    getSocket();
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },

  joinRoom(room: string) {
    rooms.add(room);
    getSocket().emit('joinRoom', room);
  },

  leaveRoom(room: string) {
    rooms.delete(room);
    socket?.emit('leaveRoom', room);
  },

  on(event: string, fn: Listener) {
    if (!listeners[event]) listeners[event] = new Set();
    listeners[event].add(fn);
    getSocket();
  },

  off(event: string, fn: Listener) {
    listeners[event]?.delete(fn);
  },

  updateToken(token: string) {
    connectToken = token;
    if (socket) {
      (socket.auth as Record<string, unknown>).token = token;
    }
  },

  isConnected(): boolean {
    return socket?.connected ?? false;
  },
};
