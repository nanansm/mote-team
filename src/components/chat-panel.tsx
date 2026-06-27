"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useRealtime } from "@/components/realtime-provider";
import {
  listChatMembers,
  listMessages,
  sendMessage,
  type ChatMember,
} from "@/app/(app)/chat/actions";
import type { ChatMessage } from "@/lib/realtime";
import { cn } from "@/lib/utils";

const timeFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
});

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Render body text with @mentions highlighted. */
function renderBody(body: string, names: string[], mine: boolean) {
  const present = names
    .filter((n) => body.includes(`@${n}`))
    .sort((a, b) => b.length - a.length);
  if (present.length === 0) return body;
  const re = new RegExp(`@(?:${present.map(escapeRe).join("|")})`, "g");
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(body))) {
    if (m.index > last) out.push(body.slice(last, m.index));
    out.push(
      <span
        key={i++}
        className={cn("font-semibold", mine ? "underline" : "text-primary")}
      >
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < body.length) out.push(body.slice(last));
  return out;
}

export function ChatPanel({ currentUserId }: { currentUserId: string }) {
  const { onMessage } = useRealtime();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listMessages().then(setMessages).catch(() => {});
    listChatMembers().then(setMembers).catch(() => {});
  }, []);

  useEffect(
    () =>
      onMessage((m) =>
        setMessages((prev) =>
          prev.some((p) => p.id === m.id) ? prev : [...prev, m],
        ),
      ),
    [onMessage],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const memberNames = useMemo(() => members.map((m) => m.name), [members]);

  const mentionMatches = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return members
      .filter((m) => m.userId !== currentUserId && m.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [mentionQuery, members, currentUserId]);

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setText(val);
    const caret = e.target.selectionStart ?? val.length;
    const before = val.slice(0, caret);
    const m = before.match(/@([^\s@]*)$/);
    setMentionQuery(m ? m[1] : null);
  }

  function pickMention(name: string) {
    const el = inputRef.current;
    const caret = el?.selectionStart ?? text.length;
    const before = text.slice(0, caret).replace(/@([^\s@]*)$/, `@${name} `);
    const after = text.slice(caret);
    const next = before + after;
    setText(next);
    setMentionQuery(null);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(before.length, before.length);
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    setMentionQuery(null);
    const r = await sendMessage(body);
    setSending(false);
    if (!r.ok) {
      toast.error(r.error);
      setText(body);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Belum ada pesan. Mulai obrolan tim.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.userId === currentUserId;
            return (
              <div
                key={m.id}
                className={cn("flex items-end gap-2", mine && "flex-row-reverse")}
              >
                <UserAvatar
                  name={m.name}
                  src={m.image}
                  className="size-7 text-[10px]"
                />
                <div className={cn("max-w-[75%]", mine && "text-right")}>
                  {!mine && (
                    <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                      {m.name}
                    </p>
                  )}
                  <div
                    className={cn(
                      "inline-block rounded-2xl px-3 py-1.5 text-sm",
                      mine
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted",
                    )}
                  >
                    <span className="whitespace-pre-wrap break-words">
                      {renderBody(m.body, memberNames, mine)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {timeFmt.format(new Date(m.createdAt))}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="relative flex items-center gap-2 border-t p-3">
        {mentionMatches.length > 0 && (
          <div className="absolute bottom-full left-3 mb-1 w-56 overflow-hidden rounded-lg border bg-popover shadow-pop">
            {mentionMatches.map((m) => (
              <button
                key={m.userId}
                type="button"
                onClick={() => pickMention(m.name)}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-accent"
              >
                <UserAvatar name={m.name} src={m.image} className="size-5 text-[9px]" />
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          value={text}
          onChange={onInput}
          placeholder="Tulis pesan… (@ untuk tag)"
          autoComplete="off"
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        />
        <Button type="submit" size="icon" disabled={sending} aria-label="Kirim">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
