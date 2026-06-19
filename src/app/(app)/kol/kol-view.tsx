"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { fmtNum as fmt, kfmt, rp } from "@/lib/format";
import { monthLabel, monthOptions } from "@/lib/month";
import { KOL_STATUS_LABEL, type KolAggregate, type KolRowComputed } from "@/lib/kol";
import type { KolStatus } from "@/lib/types";
import { deleteKol } from "./actions";
import { KolFormDialog } from "./kol-form-dialog";

const STATUS_TONE: Record<KolStatus, string> = {
  belum_bales_dm: "bg-muted text-muted-foreground",
  sudah_bales_dm: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  minta_rate_card: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  nego: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  deal: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  mau_datang_review:
    "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  sudah_posting:
    "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300",
  sudah_review:
    "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300",
  cancel: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300",
};

function StatusBadge({ status }: { status: KolStatus }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        STATUS_TONE[status],
      )}
    >
      {KOL_STATUS_LABEL[status]}
    </span>
  );
}

type ClientOpt = { id: string; name: string };

const ALL = "all";

export function KolView({
  clients,
  clientNames,
  selectedClient,
  period,
  nowMonth,
  rows,
  aggregate,
  topPosts,
}: {
  clients: ClientOpt[];
  clientNames: Record<string, string>;
  selectedClient: string;
  period: string;
  nowMonth: string;
  rows: KolRowComputed[];
  aggregate: KolAggregate;
  topPosts: KolRowComputed[];
}) {
  const allClients = selectedClient === ALL;
  const months = monthOptions(nowMonth);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<KolRowComputed | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KolRowComputed | null>(null);

  function navigate(next: { client?: string; period?: string }) {
    const c = next.client ?? selectedClient;
    const p = next.period ?? period;
    router.push(`/kol?client=${c}&period=${p}`);
  }

  function openCreate() {
    setEditRow(null);
    setFormOpen(true);
  }
  function openEdit(row: KolRowComputed) {
    setEditRow(row);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteKol(deleteTarget.id);
      if (result.ok) {
        toast.success("KOL dihapus");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const stats: { label: string; value: string }[] = [
    { label: "KOL", value: fmt(aggregate.kolCount) },
    { label: "Post", value: fmt(aggregate.postCount) },
    { label: "Total Cost", value: rp(aggregate.totalCost) },
    { label: "Reach", value: fmt(aggregate.reach) },
    { label: "Impressions", value: fmt(aggregate.impressions) },
    { label: "Interaction", value: fmt(aggregate.interaction) },
    { label: "ER %", value: `${aggregate.er}%` },
    { label: "CPE", value: rp(aggregate.cpe) },
    { label: "CPV", value: rp(aggregate.cpv) },
  ];

  return (
    <div className="space-y-4">
      {/* Filters + add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedClient}
            onValueChange={(v) => v && navigate({ client: v })}
          >
            <SelectTrigger className="w-52">
              <SelectValue>
                {(v) =>
                  v === ALL
                    ? "Semua Klien"
                    : (clients.find((c) => c.id === v)?.name ?? "Pilih klien")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua Klien</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={period}
            onValueChange={(v) => v && navigate({ period: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue>
                {(v) => (v === ALL ? "Semua bulan" : monthLabel(v as string))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua bulan</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {monthLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={openCreate}
          disabled={allClients || period === ALL}
          title={
            allClients || period === ALL
              ? "Pilih 1 klien & 1 bulan dulu untuk menambah"
              : undefined
          }
        >
          <Plus className="size-4" />
          Tambah KOL
        </Button>
      </div>

      {/* Aggregate */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border bg-card p-2 shadow-xs sm:p-3"
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">
              {s.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums sm:mt-1 sm:text-lg">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top posts */}
      {topPosts.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Top 3 Post (by interaction)
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {topPosts.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded bg-primary/10 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="truncate">
                    <span className="font-medium">{p.username}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      {fmt(p.interaction)} int · {p.er}% ER
                    </span>
                  </span>
                </span>
                {p.linkPost && (
                  <a
                    href={p.linkPost}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              {allClients && <TableHead>Client</TableHead>}
              <TableHead>Username</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-right">Reach</TableHead>
              <TableHead className="text-right">Impr</TableHead>
              <TableHead className="text-right">Interaction</TableHead>
              <TableHead className="text-right">ER %</TableHead>
              <TableHead className="text-right">CPE</TableHead>
              <TableHead className="text-right">CPV</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={allClients ? 13 : 12}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  {clients.length === 0
                    ? "Belum ada klien aktif."
                    : "Belum ada KOL untuk klien & bulan ini."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  {allClients && (
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {clientNames[r.clientId] ?? "—"}
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="text-left hover:underline"
                      >
                        {r.username}
                      </button>
                      {(r.linkPost || r.igLink || r.tiktokLink) && (
                        <a
                          href={r.linkPost || r.igLink || r.tiktokLink || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          title="Buka post"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {kfmt(r.igFollowers)} IG · {kfmt(r.tiktokFollowers)} TT
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {r.placement ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{rp(r.totalCost)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(r.reach)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(r.impressions)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(r.interaction)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.er}%</TableCell>
                  <TableCell className="text-right tabular-nums">{rp(r.cpe)}</TableCell>
                  <TableCell className="text-right tabular-nums">{rp(r.cpv)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(r)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <KolFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clientId={selectedClient}
        period={period}
        kol={editRow}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus KOL?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.username} akan dihapus permanen. Tindakan ini tidak
              bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={pending}
            >
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
