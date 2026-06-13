"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Plus, Target, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { deleteOkr } from "./actions";
import { OkrFormDialog } from "./okr-form-dialog";
import type { ClientOption, OkrRow } from "./types";

const ALL = "all";

function achievement(progress: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((progress / target) * 100);
}

function periodLabel(p: string): string {
  const [y, m] = p.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const mi = Number(m) - 1;
  return mi >= 0 && mi < 12 ? `${months[mi]} ${y}` : p;
}

export function OkrView({
  okrs,
  clients,
}: {
  okrs: OkrRow[];
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OkrRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OkrRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [periodFilter, setPeriodFilter] = useState(ALL);

  const periods = useMemo(
    () => Array.from(new Set(okrs.map((o) => o.period))).sort().reverse(),
    [okrs],
  );

  const filtered = useMemo(
    () =>
      periodFilter === ALL
        ? okrs
        : okrs.filter((o) => o.period === periodFilter),
    [okrs, periodFilter],
  );

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const r = await deleteOkr(deleteTarget.id);
      if (r.ok) {
        toast.success("OKR dihapus");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="OKR" description="Objective & Key Results per periode">
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          OKR Baru
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v ?? ALL)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Periode">
              {(v) => (v === ALL ? "Semua periode" : periodLabel(String(v)))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua periode</SelectItem>
            {periods.map((p) => (
              <SelectItem key={p} value={p}>
                {periodLabel(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-xs">
          Belum ada OKR. Klik OKR Baru untuk mulai.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((o) => {
            const pct = achievement(o.progress, o.target);
            const tone =
              pct >= 100
                ? "bg-green-600"
                : pct >= 70
                  ? "bg-primary"
                  : pct >= 40
                    ? "bg-amber-500"
                    : "bg-red-500";
            return (
              <div
                key={o.id}
                className="rounded-xl border bg-card p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Target className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium leading-snug">{o.objective}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[o.keyResult, o.clientName ?? "Internal", periodLabel(o.period)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8" aria-label="Aksi" />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(o);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(o)}
                      >
                        <Trash2 className="size-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="tabular-nums text-muted-foreground">
                      {o.progress.toLocaleString("id-ID")} /{" "}
                      {o.target.toLocaleString("id-ID")}
                    </span>
                    <span className="font-semibold tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", tone)}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OkrFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        okr={editing}
        clients={clients}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus OKR?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget?.objective}
              </span>{" "}
              akan dihapus permanen.
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
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={pending}
            >
              {pending ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
