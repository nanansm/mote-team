"use client";

import { FileText } from "lucide-react";
import { TASK_STATUS_MAP, type TaskStatus } from "@/lib/task-meta";
import { cn } from "@/lib/utils";
import type { ClientOption, TaskRow } from "./types";

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/**
 * Notion-style "Klien" view: tasks grouped under each client heading, listed by
 * name. Mirrors the Notion Master Task "Task List" grouped-by-client layout.
 */
export function TasksByClient({
  tasks,
  clients,
  onOpen,
}: {
  tasks: TaskRow[];
  clients: ClientOption[];
  onOpen: (t: TaskRow) => void;
}) {
  const groups = clients
    .map((c) => ({ client: c, items: tasks.filter((t) => t.clientId === c.id) }))
    .filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return (
      <div className="grid h-28 place-items-center rounded-2xl border bg-card text-sm text-muted-foreground shadow-card">
        Tidak ada task yang cocok dengan filter.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(({ client, items }) => (
        <section
          key={client.id}
          className="overflow-hidden rounded-2xl border bg-card shadow-card"
        >
          <header className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">{client.name}</h3>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
              {items.length}
            </span>
          </header>
          <ul className="divide-y">
            {items.map((t) => {
              const meta = TASK_STATUS_MAP[t.status as TaskStatus];
              const posting = formatDate(t.postingDate);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(t)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/50"
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground/70" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {t.title}
                    </span>
                    {t.assignees.length > 0 && (
                      <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                        {t.assignees.map((a) => a.name.split(" ")[0]).join(", ")}
                      </span>
                    )}
                    {posting && (
                      <span className="hidden shrink-0 text-xs text-muted-foreground md:inline">
                        {posting}
                      </span>
                    )}
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        meta.badge,
                      )}
                    >
                      {meta.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
