"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTaskDate } from "@/app/(app)/tasks/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { Holiday } from "@/lib/holidays";
import { TASK_STATUSES, TASK_STATUS_MAP, TYPE_CONTENTS } from "@/lib/task-meta";
import type { CalendarTask } from "./page";

const ALL = "all";

/** Selisih hari kalender (tz-aman, pakai UTC) dari `a` ke `b`. */
function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round(
    (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000,
  );
}

type ClientOpt = { id: string; name: string };

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** Shift "YYYY-MM" by delta months (pure string math). */
function shiftMonth(ym: string, delta: number): string {
  let [y, m] = ym.split("-").map(Number);
  m += delta;
  while (m < 1) { m += 12; y--; }
  while (m > 12) { m -= 12; y++; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** Monday-start weekday index (0=Mon..6=Sun) for the 1st of the month. */
function firstWeekdayMon(year: number, month: number): number {
  const dow = new Date(year, month - 1, 1).getDay(); // 0=Sun..6=Sat
  return (dow + 6) % 7;
}

export function CalendarView({
  clients,
  selectedClientId,
  month,
  tasks,
  today,
  holidays,
}: {
  clients: ClientOpt[];
  selectedClientId: string | null;
  month: string;
  tasks: CalendarTask[];
  today: string;
  holidays: Record<string, Holiday>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<CalendarTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  // ponytail: native DnD reschedule — drag a task onto a day → updateTaskDate.
  const [dragId, setDragId] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);
  const [, startDrag] = useTransition();

  function dropOn(dateStr: string) {
    const id = dragId;
    setDragId(null);
    setOverDate(null);
    if (!id) return;
    const t = tasks.find((x) => x.id === id);
    if (!t || t.postingDate === dateStr) return;
    startDrag(async () => {
      const r = await updateTaskDate(id, "postingDate", dateStr);
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }

  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const lead = firstWeekdayMon(y, m);

  const shown =
    statusFilter === ALL
      ? tasks
      : tasks.filter((t) => t.status === statusFilter);

  // Bucket tasks by day-of-month.
  const byDay = new Map<number, CalendarTask[]>();
  for (const t of shown) {
    const day = Number(t.postingDate.slice(8, 10));
    const arr = byDay.get(day) ?? [];
    arr.push(t);
    byDay.set(day, arr);
  }

  // Build grid cells (leading blanks + days).
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Libur + momen bulan ini (untuk heads-up strip), urut tanggal.
  const monthHolidays = Object.values(holidays)
    .filter((h) => h.date.startsWith(month))
    .sort((a, b) => a.date.localeCompare(b.date));

  function go(params: { client?: string; m?: string }) {
    const sp = new URLSearchParams();
    sp.set("client", params.client ?? selectedClientId ?? "");
    sp.set("m", params.m ?? month);
    router.push(`/calendar?${sp.toString()}`);
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Belum ada klien. Tambah klien dulu di menu Clients.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: client select + month nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Kalender Konten</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedClientId ?? undefined}
            onValueChange={(v) => v && go({ client: v })}
          >
            <SelectTrigger className="w-[200px]">
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
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? ALL)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status">
                {(v) =>
                  v === ALL
                    ? "Semua status"
                    : (TASK_STATUS_MAP[v as keyof typeof TASK_STATUS_MAP]?.label ?? "Status")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua status</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => go({ m: shiftMonth(month, -1) })}
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="w-[140px] text-center text-sm font-medium">
              {MONTHS[m - 1]} {y}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => go({ m: shiftMonth(month, 1) })}
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Heads-up: libur & momen konten bulan ini — biar tim tak lupa story */}
      {monthHolidays.length > 0 && (
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              Libur &amp; momen {MONTHS[m - 1]}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-red-500" /> Libur nasional
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" /> Momen konten
              </span>
            </div>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Siapkan story/konten ucapan untuk tanggal di bawah ini.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {monthHolidays.map((h) => {
              const d = diffDays(today, h.date);
              const past = d < 0;
              const isNat = h.kind === "national";
              const day = Number(h.date.slice(8, 10));
              return (
                <span
                  key={h.date + h.name}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${
                    past
                      ? "border-border bg-muted/40 text-muted-foreground line-through"
                      : isNat
                        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                  }`}
                  title={h.name}
                >
                  <span className="font-semibold tabular-nums">{day}</span>
                  <span className="max-w-[180px] truncate">{h.name}</span>
                  {!past &&
                    (d === 0 ? (
                      <span className="rounded bg-current/15 px-1 font-medium">
                        Hari ini
                      </span>
                    ) : (
                      <span className="rounded bg-current/15 px-1 font-medium tabular-nums">
                        H-{d}
                      </span>
                    ))}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-2">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const ymd =
              day != null
                ? `${month}-${String(day).padStart(2, "0")}`
                : null;
            const isToday = ymd === today;
            const holiday = ymd ? holidays[ymd] : undefined;
            const isNat = holiday?.kind === "national";
            const items = day != null ? (byDay.get(day) ?? []) : [];
            return (
              <div
                key={i}
                onDragOver={(e) => {
                  if (!dragId || !ymd) return;
                  e.preventDefault();
                  setOverDate(ymd);
                }}
                onDragLeave={() => setOverDate((d) => (d === ymd ? null : d))}
                onDrop={() => ymd && dropOn(ymd)}
                className={`min-h-[92px] border-b border-r p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0 ${
                  day == null ? "bg-muted/20" : isNat ? "bg-red-50/40 dark:bg-red-400/5" : ""
                } ${overDate && overDate === ymd ? "bg-primary/5 ring-2 ring-inset ring-primary/50" : ""}`}
              >
                {day != null && (
                  <>
                    <div
                      className={`mb-1 flex h-5 w-5 items-center justify-center rounded text-xs ${
                        isToday
                          ? "bg-primary font-semibold text-primary-foreground"
                          : isNat
                            ? "font-semibold text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </div>
                    {holiday && (
                      <div
                        className={`mb-1 truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight ${
                          isNat
                            ? "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                        }`}
                        title={holiday.name}
                      >
                        {holiday.name}
                      </div>
                    )}
                    <div className="space-y-1">
                      {items.map((t) => {
                        const st = TASK_STATUS_MAP[t.status];
                        return (
                          <button
                            key={t.id}
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              setDragId(t.id);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => {
                              setDragId(null);
                              setOverDate(null);
                            }}
                            onClick={() => setOpen(t)}
                            className={`flex w-full cursor-grab items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] hover:bg-muted active:cursor-grabbing ${
                              dragId === t.id ? "opacity-50" : ""
                            }`}
                            title={t.title}
                          >
                            <span className={`size-1.5 shrink-0 rounded-full ${st?.dot ?? "bg-zinc-400"}`} />
                            <span className="truncate">{t.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Read-only detail dialog */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>
                  Posting {open.postingDate}
                  {open.typeContent
                    ? ` · ${TYPE_CONTENTS.find((c) => c.value === open.typeContent)?.label}`
                    : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Badge className={TASK_STATUS_MAP[open.status]?.badge}>
                  {TASK_STATUS_MAP[open.status]?.label ?? open.status}
                </Badge>
                {open.mediaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={open.mediaUrl}
                    alt={open.title}
                    className="max-h-64 w-full rounded-md object-cover"
                  />
                )}
                {open.caption && (
                  <div>
                    <p className="mb-1 font-medium">Caption</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">{open.caption}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {open.linkOutput && (
                    <LinkChip href={open.linkOutput} label="Output" />
                  )}
                  {open.linkIg && <LinkChip href={open.linkIg} label="Instagram" />}
                  {open.linkTiktok && <LinkChip href={open.linkTiktok} label="TikTok" />}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LinkChip({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
    >
      <ExternalLink className="size-3" /> {label}
    </a>
  );
}
