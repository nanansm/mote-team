"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { MentionText } from "@/components/mention-text";
import {
  listChatMembers,
  listMentionableTasks,
  type ChatMember,
  type ChatTask,
} from "@/app/(app)/chat/actions";
import {
  addComment,
  deleteComment,
  listComments,
  type TaskCommentRow,
} from "./actions";

type Pick = { label: string; token: string };

function fmtWib(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TaskComments({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<TaskCommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TaskCommentRow | null>(null);
  const [pending, start] = useTransition();

  // ponytail: @/# mention picker ported from chat-panel.tsx (textarea variant).
  // Extract into a shared hook if a third caller ever needs it.
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [tasks, setTasks] = useState<ChatTask[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [taskQuery, setTaskQuery] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listChatMembers().then(setMembers).catch(() => {});
    listMentionableTasks().then(setTasks).catch(() => {});
  }, []);

  const memberNames = useMemo(() => members.map((m) => m.name), [members]);

  const mentionMatches = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6);
  }, [mentionQuery, members]);

  const taskMatches = useMemo(() => {
    if (taskQuery === null) return [];
    const q = taskQuery.toLowerCase();
    return tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 8);
  }, [taskQuery, tasks]);

  function onInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setBody(val);
    const caret = e.target.selectionStart ?? val.length;
    const before = val.slice(0, caret);
    const at = before.match(/@([^\s@]*)$/);
    const hash = before.match(/#([^\s#]*)$/);
    setMentionQuery(at ? at[1] : null);
    setTaskQuery(at ? null : hash ? hash[1] : null);
  }

  function recordSelection(before: string, after: string) {
    const el = inputRef.current;
    setBody(before + after);
    setMentionQuery(null);
    setTaskQuery(null);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(before.length, before.length);
    });
  }

  function pickMention(mem: ChatMember) {
    const el = inputRef.current;
    const caret = el?.selectionStart ?? body.length;
    const before = body.slice(0, caret).replace(/@([^\s@]*)$/, `@${mem.name} `);
    setPicks((p) => [
      ...p,
      { label: `@${mem.name}`, token: `@[${mem.name}](u:${mem.userId})` },
    ]);
    recordSelection(before, body.slice(caret));
  }

  function pickTask(t: ChatTask) {
    const el = inputRef.current;
    const caret = el?.selectionStart ?? body.length;
    const before = body.slice(0, caret).replace(/#([^\s#]*)$/, `#${t.title} `);
    setPicks((p) => [
      ...p,
      { label: `#${t.title}`, token: `#[${t.title}](t:${t.id})` },
    ]);
    recordSelection(before, body.slice(caret));
  }

  /** Swap each picked readable label for its `@[..](u:id)` / `#[..](t:id)` token. */
  function buildBody(raw: string): string {
    if (picks.length === 0) return raw;
    const map = new Map(picks.map((p) => [p.label, p.token]));
    const labels = [...map.keys()].sort((a, b) => b.length - a.length).map(escapeRe);
    const re = new RegExp(`(?:${labels.join("|")})(?![\\p{L}\\p{N}_])`, "gu");
    return raw.replace(re, (m) => map.get(m) ?? m);
  }

  async function reload() {
    try {
      setComments(await listComments(taskId));
    } catch {
      toast.error("Gagal memuat komentar");
    } finally {
      setLoading(false);
    }
  }

  // Load on taskId change, dropping stale responses if the task switches
  // before the in-flight request resolves.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listComments(taskId)
      .then((rows) => {
        if (!cancelled) setComments(rows);
      })
      .catch(() => {
        if (!cancelled) toast.error("Gagal memuat komentar");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  function submit() {
    const text = body.trim();
    if (!text) return;
    start(async () => {
      const r = await addComment(taskId, buildBody(text));
      if (r.ok) {
        setBody("");
        setPicks([]);
        setMentionQuery(null);
        setTaskQuery(null);
        await reload();
      } else {
        toast.error(r.error);
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    start(async () => {
      const r = await deleteComment(deleteTarget.id);
      if (r.ok) {
        setDeleteTarget(null);
        await reload();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Komentar {comments.length > 0 && `(${comments.length})`}
      </p>

      <div className="space-y-2">
        <div className="relative">
          {mentionMatches.length > 0 && (
            <div className="absolute bottom-full left-0 z-10 mb-1 w-56 overflow-hidden rounded-lg border bg-popover shadow-pop">
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
            <div className="absolute bottom-full left-0 z-10 mb-1 max-h-64 w-72 overflow-y-auto rounded-lg border bg-popover shadow-pop">
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
          <Textarea
            ref={inputRef}
            value={body}
            onChange={onInput}
            placeholder="Tulis catatan untuk tim… (@ orang · # task)"
            rows={2}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={submit} disabled={pending || !body.trim()}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Kirim
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada komentar.</p>
      ) : (
        <ul className="space-y-2.5">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border bg-background p-2.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium">{c.authorName}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{fmtWib(c.createdAt)}</span>
                  {c.canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Hapus komentar"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <MentionText
                body={c.body}
                names={memberNames}
                className="whitespace-pre-wrap break-words text-sm text-foreground"
              />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus komentar?</DialogTitle>
            <DialogDescription>
              Komentar akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={pending}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              {pending ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
