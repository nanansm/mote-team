"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { MentionText } from "@/components/mention-text";
import { useRealtime } from "@/components/realtime-provider";
import {
  listChatMembers,
  listMentionableTasks,
  listMessages,
  sendMessage,
  type ChatMember,
  type ChatTask,
} from "@/app/(app)/chat/actions";
import type { ChatMessage } from "@/lib/realtime";
import { cn } from "@/lib/utils";

type Pick = { label: string; token: string };

const timeFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
});

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function ChatPanel({ currentUserId }: { currentUserId: string }) {
  const { onMessage } = useRealtime();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [tasks, setTasks] = useState<ChatTask[]>([]);
  const [text, setText] = useState("");
  const [picks, setPicks] = useState<Pick[]>([]);
  const [sending, setSending] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [taskQuery, setTaskQuery] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listMessages().then(setMessages).catch(() => {});
    listChatMembers().then(setMembers).catch(() => {});
    listMentionableTasks().then(setTasks).catch(() => {});
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

  const taskMatches = useMemo(() => {
    if (taskQuery === null) return [];
    const q = taskQuery.toLowerCase();
    return tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 8);
  }, [taskQuery, tasks]);

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setText(val);
    const caret = e.target.selectionStart ?? val.length;
    const before = val.slice(0, caret);
    const at = before.match(/@([^\s@]*)$/);
    const hash = before.match(/#([^\s#]*)$/);
    setMentionQuery(at ? at[1] : null);
    setTaskQuery(at ? null : hash ? hash[1] : null);
  }

  function recordSelection(el: HTMLInputElement | null, before: string, after: string) {
    setText(before + after);
    setMentionQuery(null);
    setTaskQuery(null);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(before.length, before.length);
    });
  }

  function pickMention(mem: ChatMember) {
    const el = inputRef.current;
    const caret = el?.selectionStart ?? text.length;
    const before = text.slice(0, caret).replace(/@([^\s@]*)$/, `@${mem.name} `);
    setPicks((p) => [
      ...p,
      { label: `@${mem.name}`, token: `@[${mem.name}](u:${mem.userId})` },
    ]);
    recordSelection(el, before, text.slice(caret));
  }

  function pickTask(t: ChatTask) {
    const el = inputRef.current;
    const caret = el?.selectionStart ?? text.length;
    const before = text.slice(0, caret).replace(/#([^\s#]*)$/, `#${t.title} `);
    setPicks((p) => [
      ...p,
      { label: `#${t.title}`, token: `#[${t.title}](t:${t.id})` },
    ]);
    recordSelection(el, before, text.slice(caret));
  }

  /** Swap each picked readable label for its `@[..](u:id)` / `#[..](t:id)` token. */
  function buildBody(raw: string): string {
    if (picks.length === 0) return raw;
    const map = new Map(picks.map((p) => [p.label, p.token]));
    // ponytail: longest label first so "@Don" can't clobber "@Donita"; word
    // boundary lookahead stops a label matching a longer surrounding word.
    const labels = [...map.keys()].sort((a, b) => b.length - a.length).map(escapeRe);
    const re = new RegExp(`(?:${labels.join("|")})(?![\\p{L}\\p{N}_])`, "gu");
    return raw.replace(re, (m) => map.get(m) ?? m);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const raw = text.trim();
    if (!raw || sending) return;
    const body = buildBody(raw);
    const prevPicks = picks;
    setSending(true);
    setText("");
    setPicks([]);
    setMentionQuery(null);
    setTaskQuery(null);
    const r = await sendMessage(body);
    setSending(false);
    if (!r.ok) {
      toast.error(r.error);
      setText(raw);
      setPicks(prevPicks);
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
                    <MentionText
                      body={m.body}
                      names={memberNames}
                      mine={mine}
                      className="whitespace-pre-wrap break-words"
                    />
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
                onClick={() => pickMention(m)}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-accent"
              >
                <UserAvatar name={m.name} src={m.image} className="size-5 text-[9px]" />
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        )}
        {taskMatches.length > 0 && (
          <div className="absolute bottom-full left-3 mb-1 max-h-64 w-72 overflow-y-auto rounded-lg border bg-popover shadow-pop">
            {taskMatches.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pickTask(t)}
                className="flex w-full flex-col items-start px-2.5 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span className="w-full truncate font-medium">{t.title}</span>
                <span className="w-full truncate text-xs text-muted-foreground">
                  {t.clientName}
                </span>
              </button>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          value={text}
          onChange={onInput}
          placeholder="Tulis pesan… (@ orang · # task)"
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
