"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TASK_STATUSES,
  TASK_STATUS_MAP,
  TYPE_CONTENTS,
  type TaskStatus,
  type TypeContent,
} from "@/lib/task-meta";
import { createTask, updateTask } from "./actions";
import type { ClientOption, MemberOption, TaskRow } from "./types";

const NONE = "__none__";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskRow | null;
  clients: ClientOption[];
  members: MemberOption[];
  allTasks: TaskRow[];
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  clients,
  members,
  allTasks,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(task);

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<TaskStatus>("not_started");
  const [typeContent, setTypeContent] = useState<TypeContent | "">("");
  const [parentId, setParentId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [postingDate, setPostingDate] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [linkMateri, setLinkMateri] = useState("");
  const [linkOutput, setLinkOutput] = useState("");
  const [linkIg, setLinkIg] = useState("");
  const [linkTiktok, setLinkTiktok] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setClientId(task?.clientId ?? clients[0]?.id ?? "");
    setStatus(task?.status ?? "not_started");
    setTypeContent(task?.typeContent ?? "");
    setParentId(task?.parentId ?? "");
    setDueDate(task?.dueDate ?? "");
    setPostingDate(task?.postingDate ?? "");
    setAssignees(task?.assignees.map((a) => a.id) ?? []);
    setCaption(task?.caption ?? "");
    setLinkMateri(task?.linkMateri ?? "");
    setLinkOutput(task?.linkOutput ?? "");
    setLinkIg(task?.linkIg ?? "");
    setLinkTiktok(task?.linkTiktok ?? "");
    setMediaUrl(task?.mediaUrl ?? "");
  }, [open, task, clients]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setMediaUrl(data.url);
      else toast.error(data.error ?? "Upload gagal");
    } catch {
      toast.error("Upload gagal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Parent candidates: top-level tasks of the same client, excluding self.
  const parentOptions = useMemo(
    () =>
      allTasks.filter(
        (t) => t.clientId === clientId && t.id !== task?.id && !t.parentId,
      ),
    [allTasks, clientId, task?.id],
  );

  function toggleAssignee(id: string) {
    setAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title,
      clientId,
      status,
      typeContent: typeContent === "" ? null : typeContent,
      parentId: parentId === "" ? null : parentId,
      dueDate,
      postingDate,
      caption,
      linkMateri,
      linkOutput,
      linkIg,
      linkTiktok,
      mediaUrl,
      assigneeIds: assignees,
    };
    startTransition(async () => {
      const result = isEdit
        ? await updateTask(task!.id, payload)
        : await createTask(payload);
      if (result.ok) {
        toast.success(isEdit ? "Task diperbarui" : "Task ditambahkan");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Task" : "Task Baru"}</DialogTitle>
            <DialogDescription>
              Konten / pekerjaan untuk satu klien.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="KLIEN - PLATFORM - BULAN - Judul"
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client">Klien</Label>
                <Select
                  value={clientId}
                  onValueChange={(v) => setClientId(v ?? "")}
                >
                  <SelectTrigger id="client" className="w-full">
                    <SelectValue placeholder="Pilih klien">
                      {(v) => clients.find((c) => c.id === v)?.name ?? "Pilih klien"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus((v ?? status) as TaskStatus)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue>
                      {(v) => TASK_STATUS_MAP[v as TaskStatus]?.label ?? "Status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipe Konten</Label>
                <Select
                  value={typeContent === "" ? NONE : typeContent}
                  onValueChange={(v) =>
                    setTypeContent(!v || v === NONE ? "" : (v as TypeContent))
                  }
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="—">
                      {(v) =>
                        !v || v === NONE
                          ? "—"
                          : (TYPE_CONTENTS.find((t) => t.value === v)?.label ?? "—")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>—</SelectItem>
                    {TYPE_CONTENTS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Sub-task dari</Label>
                <Select
                  value={parentId === "" ? NONE : parentId}
                  onValueChange={(v) => setParentId(!v || v === NONE ? "" : v)}
                >
                  <SelectTrigger id="parent" className="w-full">
                    <SelectValue placeholder="— (task utama)">
                      {(v) =>
                        !v || v === NONE
                          ? "— (task utama)"
                          : (allTasks.find((t) => t.id === v)?.title ?? "—")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>— (task utama)</SelectItem>
                    {parentOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due">Due Date</Label>
                <Input
                  id="due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="posting">Tanggal Posting</Label>
                <Input
                  id="posting"
                  type="date"
                  value={postingDate}
                  onChange={(e) => setPostingDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <div className="flex flex-wrap gap-2">
                {members.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    Belum ada anggota tim.
                  </span>
                )}
                {members.map((m) => {
                  const on = assignees.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleAssignee(m.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition-colors",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-background hover:bg-accent",
                      )}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption / Brief</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Caption, brief, atau catatan…"
              />
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              {mediaUrl ? (
                <div className="flex items-center gap-3 rounded-md border p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaUrl}
                    alt="Media"
                    className="size-14 rounded object-cover"
                  />
                  <span className="flex-1 truncate text-xs text-muted-foreground">
                    {mediaUrl.split("/").pop()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => setMediaUrl("")}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                    {uploading ? "Mengunggah…" : "Unggah gambar"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="materi">Link Materi</Label>
                <Input id="materi" value={linkMateri} onChange={(e) => setLinkMateri(e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="output">Link Output</Label>
                <Input id="output" value={linkOutput} onChange={(e) => setLinkOutput(e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ig">Link Posting IG</Label>
                <Input id="ig" value={linkIg} onChange={(e) => setLinkIg(e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tt">Link Posting TikTok</Label>
                <Input id="tt" value={linkTiktok} onChange={(e) => setLinkTiktok(e.target.value)} placeholder="https://…" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
