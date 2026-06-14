"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarPlus, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
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
import { TYPE_CONTENTS } from "@/lib/task-meta";
import {
  createTemplate,
  deleteTemplate,
  generateMonth,
  type TemplateRow,
} from "./actions";

type ClientOpt = { id: string; name: string };
const NONE = "none";

export function TemplatesView({
  clients,
  selectedClientId,
  templates,
  defaultMonth,
}: {
  clients: ClientOpt[];
  selectedClientId: string | null;
  templates: TemplateRow[];
  defaultMonth: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<TemplateRow | null>(null);
  const [genOpen, setGenOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(defaultMonth);

  // Add-row form
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>(NONE);
  const [day, setDay] = useState("");
  const [caption, setCaption] = useState("");

  function setClient(id: string | null) {
    if (id) router.push(`/templates?client=${id}`);
  }

  function add() {
    if (!selectedClientId || !title.trim()) return;
    start(async () => {
      const r = await createTemplate({
        clientId: selectedClientId,
        title,
        typeContent: type === NONE ? null : (type as "carousel" | "reels"),
        dayOfMonth: day ? Number(day) : null,
        caption,
      });
      if (r.ok) {
        toast.success("Baris template ditambahkan");
        setTitle("");
        setType(NONE);
        setDay("");
        setCaption("");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    start(async () => {
      const r = await deleteTemplate(deleteTarget.id);
      if (r.ok) {
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function runGenerate() {
    if (!selectedClientId) return;
    start(async () => {
      const r = await generateMonth(selectedClientId, genMonth);
      if (r.ok) {
        toast.success(`${r.created} task dibuat, ${r.skipped} dilewati (sudah ada)`);
        setGenOpen(false);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Belum ada klien. Tambah klien dulu di menu Clients.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Template Konten"
        description="Baris konten berulang per klien. Generate jadi task tiap bulan sekali klik."
      >
        <Button
          onClick={() => setGenOpen(true)}
          disabled={!selectedClientId || templates.length === 0}
        >
          <CalendarPlus className="size-4" />
          Generate Bulan
        </Button>
      </PageHeader>

      <Select value={selectedClientId ?? undefined} onValueChange={setClient}>
        <SelectTrigger className="w-[220px]">
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

      {/* Add row */}
      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="mb-3 text-sm font-medium">Tambah baris</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_140px_90px_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="t-title">Judul</Label>
            <Input
              id="t-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. Reels mingguan"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-type">Tipe</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? NONE)}>
              <SelectTrigger id="t-type" className="w-full">
                <SelectValue>
                  {(v) =>
                    v === NONE
                      ? "—"
                      : (TYPE_CONTENTS.find((c) => c.value === v)?.label ?? "—")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {TYPE_CONTENTS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-day">Tgl</Label>
            <Input
              id="t-day"
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="1-31"
            />
          </div>
          <Button onClick={add} disabled={pending || !title.trim()}>
            <Plus className="size-4" />
            Tambah
          </Button>
        </div>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor="t-caption">Caption / brief (opsional)</Label>
          <Textarea
            id="t-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="Caption default untuk task ini"
          />
        </div>
      </div>

      {/* Rows list */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {templates.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Belum ada baris template untuk klien ini.
          </p>
        ) : (
          <ul className="divide-y">
            {templates.map((t) => (
              <li key={t.id} className="flex items-start gap-3 p-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-md border bg-muted/40 text-xs font-semibold text-muted-foreground">
                  {t.dayOfMonth ? `#${t.dayOfMonth}` : "—"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.typeContent
                      ? TYPE_CONTENTS.find((c) => c.value === t.typeContent)?.label
                      : "Tanpa tipe"}
                    {t.caption ? ` · ${t.caption.slice(0, 60)}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTarget(t)}
                  aria-label="Hapus baris"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Generate dialog */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate task bulan ini</DialogTitle>
            <DialogDescription>
              Bikin {templates.length} task dari template untuk bulan terpilih.
              Task yang sudah ada (judul + tanggal sama) dilewati.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="gen-month">Bulan</Label>
            <Input
              id="gen-month"
              type="month"
              value={genMonth}
              onChange={(e) => setGenMonth(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenOpen(false)} disabled={pending}>
              Batal
            </Button>
            <Button onClick={runGenerate} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus baris template?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.title}</span>{" "}
              akan dihapus. Task yang sudah ter-generate tidak terpengaruh.
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
