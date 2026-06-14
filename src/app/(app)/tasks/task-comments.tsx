"use client";

import { useEffect, useState, useTransition } from "react";
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
import { Linkify } from "@/components/linkify";
import {
  addComment,
  deleteComment,
  listComments,
  type TaskCommentRow,
} from "./actions";

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

export function TaskComments({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<TaskCommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TaskCommentRow | null>(null);
  const [pending, start] = useTransition();

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
      const r = await addComment(taskId, text);
      if (r.ok) {
        setBody("");
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
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tulis catatan / link untuk tim…"
          rows={2}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
        />
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
              <Linkify text={c.body} className="text-sm text-foreground" />
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
