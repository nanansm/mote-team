"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ChatMessage, OnlineUser } from "@/lib/realtime";

type Ctx = {
  online: OnlineUser[];
  /** Subscribe to incoming chat messages. Returns an unsubscribe fn. */
  onMessage: (cb: (m: ChatMessage) => void) => () => void;
};

const RealtimeContext = createContext<Ctx>({
  online: [],
  onMessage: () => () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const subs = useRef(new Set<(m: ChatMessage) => void>());

  useEffect(() => {
    const es = new EventSource("/api/realtime");
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data) as
        | { type: "presence"; users: OnlineUser[] }
        | { type: "message"; message: ChatMessage };
      if (data.type === "presence") setOnline(data.users);
      else if (data.type === "message")
        subs.current.forEach((cb) => cb(data.message));
    };
    // EventSource auto-reconnects on drop; nothing else to do.
    return () => es.close();
  }, []);

  const onMessage = useCallback((cb: (m: ChatMessage) => void) => {
    subs.current.add(cb);
    return () => {
      subs.current.delete(cb);
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ online, onMessage }}>
      {children}
    </RealtimeContext.Provider>
  );
}
