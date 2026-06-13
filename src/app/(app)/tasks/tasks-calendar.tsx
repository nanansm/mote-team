"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TASK_STATUS_MAP, type TaskStatus } from "@/lib/task-meta";
import { ymdJakarta } from "@/lib/tz";
import { cn } from "@/lib/utils";
import type { TaskRow } from "./types";

const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function TasksCalendar({
  tasks,
  onOpen,
}: {
  tasks: TaskRow[];
  onOpen: (t: TaskRow) => void;
}) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const first = new Date(cursor.y, cursor.m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const todayY = ymdJakarta(now);

  const byDate = new Map<string, TaskRow[]>();
  for (const t of tasks) {
    if (!t.postingDate) continue;
    const list = byDate.get(t.postingDate) ?? [];
    list.push(t);
    byDate.set(t.postingDate, list);
  }
  const ymd = (d: number) =>
    `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function shift(delta: number) {
    setCursor((c) => {
      const nm = c.m + delta;
      return { y: c.y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 };
    });
  }

  const noDate = tasks.filter((t) => !t.postingDate).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {MONTHS[cursor.m]} {cursor.y}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setCursor({ y: now.getFullYear(), m: now.getMonth() })}>
            Hari ini
          </Button>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Bulan sebelumnya" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Bulan berikutnya" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
          {DOW.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            if (d === null)
              return <div key={i} className="min-h-24 border-b border-r bg-muted/20" />;
            const dateStr = ymd(d);
            const items = byDate.get(dateStr) ?? [];
            const isToday = dateStr === todayY;
            return (
              <div
                key={i}
                className={cn(
                  "min-h-24 space-y-1 border-b border-r p-1.5",
                  isToday && "bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full text-xs",
                    isToday && "bg-primary font-semibold text-primary-foreground",
                    !isToday && "text-muted-foreground",
                  )}
                >
                  {d}
                </span>
                {items.slice(0, 3).map((t) => {
                  const meta = TASK_STATUS_MAP[t.status as TaskStatus];
                  return (
                    <button
                      key={t.id}
                      onClick={() => onOpen(t)}
                      className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] hover:bg-accent"
                      title={t.title}
                    >
                      <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
                      <span className="truncate">{t.title}</span>
                    </button>
                  );
                })}
                {items.length > 3 && (
                  <span className="px-1 text-[10px] text-muted-foreground">
                    +{items.length - 3} lagi
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {noDate > 0 && (
        <p className="text-xs text-muted-foreground">
          {noDate} task tanpa tanggal posting tidak tampil di kalender.
        </p>
      )}
    </div>
  );
}
