"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "@/components/chat-panel";
import { useRealtime } from "@/components/realtime-provider";
import { unreadMentionCount } from "@/app/(app)/chat/actions";
import { cn } from "@/lib/utils";

const READ_KEY = "chat:lastReadAt";

/**
 * Floating, non-modal team chat. Bottom-right launcher toggles a compact popup
 * that overlays (never blocks) the page. Red badge = you were @-mentioned;
 * green dot = other unread messages.
 */
export function ChatWidget({
  currentUserId,
  currentUserName,
}: {
  currentUserId: string;
  currentUserName: string;
}) {
  const { onMessage } = useRealtime();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [mentions, setMentions] = useState(0);

  // Restore unread-mention count across reloads (per-device last-read marker).
  useEffect(() => {
    const since = localStorage.getItem(READ_KEY);
    unreadMentionCount(since).then(setMentions).catch(() => {});
  }, []);

  useEffect(
    () =>
      onMessage((m) => {
        if (m.userId === currentUserId || open) return;
        setUnread((u) => u + 1);
        if (
          m.body.includes(`(u:${currentUserId})`) ||
          m.body.includes(`@${currentUserName}`)
        )
          setMentions((c) => c + 1);
      }),
    [onMessage, open, currentUserId, currentUserName],
  );

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) {
        setUnread(0);
        setMentions(0);
        localStorage.setItem(READ_KEY, new Date().toISOString());
      }
      return next;
    });
  }

  return (
    <>
      {open && (
        <div
          className={cn(
            "fixed z-40 flex flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl",
            "bottom-3 right-3 left-3 h-[60vh] max-h-[26rem]", // mobile: compact card
            "sm:left-auto sm:bottom-24 sm:right-4 sm:h-[30rem] sm:max-h-none sm:w-96", // desktop
          )}
          role="dialog"
          aria-label="Chat tim"
        >
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-primary" />
              <span className="font-medium">Chat Tim</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent"
              aria-label="Tutup chat"
            >
              <X className="size-4" />
            </button>
          </div>
          <ChatPanel currentUserId={currentUserId} />
        </div>
      )}

      <button
        onClick={toggle}
        aria-label={open ? "Tutup chat" : "Buka chat tim"}
        className={cn(
          "fixed bottom-4 right-4 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95",
          open && "max-sm:hidden",
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && mentions > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white ring-2 ring-background">
            {mentions > 9 ? "9+" : mentions}
          </span>
        )}
        {!open && mentions === 0 && unread > 0 && (
          <span className="absolute right-1 top-1 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        )}
      </button>
    </>
  );
}
