import { EventEmitter } from "events";

/**
 * In-process realtime bus for presence + team chat. Single Node process
 * (Easypanel runs one `next start` replica) so an in-memory EventEmitter is
 * enough for instant fan-out — no Redis, no polling.
 *
 * ponytail: in-memory, 1-replica only. If this ever scales to >1 replica,
 * swap the bus for Postgres LISTEN/NOTIFY (postgres.js already supports it).
 */

export type OnlineUser = { userId: string; name: string; image: string | null };

export type ChatMessage = {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  body: string;
  createdAt: string; // ISO instant
};

export type RealtimeEvent =
  | { type: "presence"; users: OnlineUser[] }
  | { type: "message"; message: ChatMessage };

// Survive HMR in dev (module re-eval) by stashing on globalThis.
const g = globalThis as unknown as {
  __moteBus?: EventEmitter;
  __moteConns?: Map<string, { info: OnlineUser; count: number }>;
};

const bus = g.__moteBus ?? new EventEmitter();
bus.setMaxListeners(0); // one listener per open SSE connection
const conns = g.__moteConns ?? new Map<string, { info: OnlineUser; count: number }>();
g.__moteBus = bus;
g.__moteConns = conns;

export function onlineUsers(): OnlineUser[] {
  return [...conns.values()].map((c) => c.info);
}

function broadcastPresence() {
  bus.emit("event", { type: "presence", users: onlineUsers() } satisfies RealtimeEvent);
}

/** Register an open connection for a user (refcounted across tabs). Returns cleanup. */
export function addClient(info: OnlineUser): () => void {
  const existing = conns.get(info.userId);
  if (existing) existing.count++;
  else conns.set(info.userId, { info, count: 1 });
  broadcastPresence();
  return () => {
    const e = conns.get(info.userId);
    if (!e) return;
    e.count--;
    if (e.count <= 0) conns.delete(info.userId);
    broadcastPresence();
  };
}

export function subscribe(cb: (e: RealtimeEvent) => void): () => void {
  bus.on("event", cb);
  return () => bus.off("event", cb);
}

export function publish(e: RealtimeEvent) {
  bus.emit("event", e);
}
