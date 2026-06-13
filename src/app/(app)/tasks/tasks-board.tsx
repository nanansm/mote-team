"use client";

import { TASK_STATUSES } from "@/lib/task-meta";
import { cn } from "@/lib/utils";
import type { TaskRow } from "./types";

function fmt(v: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function TasksBoard({
  tasks,
  onOpen,
}: {
  tasks: TaskRow[];
  onOpen: (t: TaskRow) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {TASK_STATUSES.map((s) => {
        const col = tasks.filter((t) => t.status === s.value);
        return (
          <div key={s.value} className="flex w-64 shrink-0 flex-col">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <span className={cn("size-2 rounded-full", s.dot)} />
                {s.label}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {col.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 rounded-xl bg-muted/40 p-2">
              {col.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  —
                </p>
              ) : (
                col.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onOpen(t)}
                    className="hover-lift w-full rounded-lg border bg-card p-3 text-left shadow-xs hover:shadow-card"
                  >
                    <p className="line-clamp-2 text-sm font-medium">{t.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {t.clientName}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {t.assignees.slice(0, 2).map((a) => (
                          <span
                            key={a.id}
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {a.name.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                      {t.postingDate && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {fmt(t.postingDate)}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
