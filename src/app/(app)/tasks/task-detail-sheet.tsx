"use client";

import { useTransition } from "react";
import { ExternalLink, Link2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TASK_STATUS_MAP, TYPE_CONTENTS, type TaskStatus } from "@/lib/task-meta";
import { cn } from "@/lib/utils";
import { ensureApprovalLink } from "./actions";
import { TaskComments } from "./task-comments";
import type { TaskRow } from "./types";

function fmt(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function LinkRow({ label, url }: { label: string; url: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent"
    >
      <span>{label}</span>
      <ExternalLink className="size-3.5 text-muted-foreground" />
    </a>
  );
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onEdit,
}: {
  task: TaskRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit: (t: TaskRow) => void;
}) {
  const [sharing, startSharing] = useTransition();
  if (!task) return null;
  const meta = TASK_STATUS_MAP[task.status as TaskStatus];
  const type = TYPE_CONTENTS.find((t) => t.value === task.typeContent)?.label;

  function shareApproval() {
    if (!task) return;
    startSharing(async () => {
      const res = await ensureApprovalLink(task.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      try {
        await navigator.clipboard.writeText(res.url);
        toast.success("Link approval disalin ke clipboard");
      } catch {
        toast.success(res.url);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="pr-8 text-base leading-snug">{task.title}</DialogTitle>
          <DialogDescription>{task.clientName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", meta.badge)}>
              {meta.label}
            </span>
            {type && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {type}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={shareApproval}
              disabled={sharing}
            >
              <Link2 className="size-4" />
              Approval
            </Button>
            <Button size="sm" onClick={() => onEdit(task)}>
              <Pencil className="size-4" />
              Edit
            </Button>
          </div>

          {task.mediaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={task.mediaUrl}
              alt=""
              className="max-h-56 w-full rounded-lg border object-cover"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Due date">{fmt(task.dueDate)}</Field>
            <Field label="Tanggal posting">{fmt(task.postingDate)}</Field>
          </div>

          <Field label="Assignee">
            {task.assignees.length === 0 ? (
              <span className="text-muted-foreground">Belum ada</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {task.assignees.map((a) => (
                  <span key={a.id} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {a.name}
                  </span>
                ))}
              </div>
            )}
          </Field>

          {task.caption && (
            <Field label="Caption / Brief">
              <p className="whitespace-pre-wrap text-muted-foreground">{task.caption}</p>
            </Field>
          )}

          {(task.linkMateri || task.linkOutput || task.linkIg || task.linkTiktok) && (
            <Field label="Link">
              <div className="space-y-1.5">
                <LinkRow label="Materi" url={task.linkMateri} />
                <LinkRow label="Output" url={task.linkOutput} />
                <LinkRow label="Posting IG" url={task.linkIg} />
                <LinkRow label="Posting TikTok" url={task.linkTiktok} />
              </div>
            </Field>
          )}

          <div className="border-t pt-4">
            <TaskComments taskId={task.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
