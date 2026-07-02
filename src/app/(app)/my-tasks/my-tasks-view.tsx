"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TaskStatusSelect } from "@/components/task-status-select";
import { Button } from "@/components/ui/button";
import { isDone } from "@/lib/task-meta";
import { todayJakarta, ymdOffset } from "@/lib/tz";
import { cn } from "@/lib/utils";
import { TaskDetailSheet } from "../tasks/task-detail-sheet";
import { TaskFormDialog } from "../tasks/task-form-dialog";
import type { ClientOption, MemberOption, TaskRow } from "../tasks/types";

function Row({
  t,
  tone,
  onOpen,
}: {
  t: TaskRow;
  tone?: string;
  onOpen: (t: TaskRow) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-accent/40">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => onOpen(t)}
          className="truncate text-left text-sm font-medium hover:text-primary hover:underline"
          title={t.title}
        >
          {t.title}
        </button>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t.clientName}</span>
          {t.dueDate && (
            <span className={cn("flex items-center gap-1", tone)}>
              <CalendarClock className="size-3" />
              {new Date(t.dueDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </p>
      </div>
      <TaskStatusSelect taskId={t.id} status={t.status} />
    </div>
  );
}

function Section({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count: number;
  tone?: string;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {title}
        <span className={cn("rounded-full px-1.5 text-xs", tone ?? "bg-muted text-muted-foreground")}>
          {count}
        </span>
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function MyTasksView({
  tasks,
  clients,
  members,
  firstName,
}: {
  tasks: TaskRow[];
  clients: ClientOption[];
  members: MemberOption[];
  firstName: string;
}) {
  const [detail, setDetail] = useState<TaskRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function openDetail(t: TaskRow) {
    setDetail(t);
    setDetailOpen(true);
  }

  const today = todayJakarta();
  const weekAhead = ymdOffset(7);

  const active = tasks.filter((r) => !isDone(r.status));
  const overdue = active.filter((r) => r.dueDate && r.dueDate < today);
  const thisWeek = active.filter(
    (r) => r.dueDate && r.dueDate >= today && r.dueDate <= weekAhead,
  );
  const later = active.filter((r) => r.dueDate && r.dueDate > weekAhead);
  const noDue = active.filter((r) => !r.dueDate);
  const done = tasks.filter((r) => isDone(r.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Halo, ${firstName} 👋`}
        description={`${active.length} task aktif buat kamu`}
      >
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/tasks" />}
        >
          Semua task
        </Button>
      </PageHeader>

      {active.length === 0 && done.length === 0 ? (
        <div className="grid place-items-center rounded-xl border bg-card p-10 text-center shadow-xs">
          <CheckCircle2 className="size-8 text-green-600" />
          <p className="mt-3 text-sm font-medium">Belum ada task buat kamu</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Task yang di-assign ke kamu akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <Section title="⚠️ Lewat deadline" count={overdue.length} tone="bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300">
            {overdue.map((t) => (
              <Row key={t.id} t={t} tone="text-red-600 font-medium dark:text-red-400" onOpen={openDetail} />
            ))}
          </Section>
          <Section title="Minggu ini" count={thisWeek.length} tone="bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
            {thisWeek.map((t) => (
              <Row key={t.id} t={t} tone="text-amber-600 dark:text-amber-400" onOpen={openDetail} />
            ))}
          </Section>
          <Section title="Nanti" count={later.length}>
            {later.map((t) => (
              <Row key={t.id} t={t} onOpen={openDetail} />
            ))}
          </Section>
          <Section title="Tanpa deadline" count={noDue.length}>
            {noDue.map((t) => (
              <Row key={t.id} t={t} onOpen={openDetail} />
            ))}
          </Section>
          <Section title="Selesai" count={done.length} tone="bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300">
            {done.slice(0, 10).map((t) => (
              <Row key={t.id} t={t} onOpen={openDetail} />
            ))}
          </Section>
        </div>
      )}

      <TaskDetailSheet
        task={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(t) => {
          setDetailOpen(false);
          setEditing(t);
          setFormOpen(true);
        }}
      />

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        clients={clients}
        members={members}
        allTasks={tasks}
      />
    </div>
  );
}
