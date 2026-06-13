import { asc, eq } from "drizzle-orm";
import { CalendarClock, CheckCircle2, Inbox } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TaskStatusSelect } from "@/components/task-status-select";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { client, task, taskAssignee } from "@/db/schema";
import { getMemberFor } from "@/lib/member";
import { requireSession } from "@/lib/session";
import { isDone, type TaskStatus } from "@/lib/task-meta";
import { todayJakarta, ymdOffset } from "@/lib/tz";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
  clientName: string;
};

function TaskRow({ t, tone }: { t: Row; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-accent/40">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{t.title}</p>
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

export default async function MyTasksPage() {
  const session = await requireSession();
  const member = await getMemberFor({
    id: session.user.id,
    email: session.user.email,
  });

  if (!member) {
    return (
      <div className="space-y-6">
        <PageHeader title="Task Saya" />
        <div className="grid place-items-center rounded-xl border bg-card p-10 text-center shadow-xs">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Akun belum terhubung ke profil tim</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Minta admin menautkan email kamu di menu Team supaya task yang
            di-assign muncul di sini.
          </p>
        </div>
      </div>
    );
  }

  const rows = (await db
    .select({
      id: task.id,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      clientName: client.name,
    })
    .from(taskAssignee)
    .innerJoin(task, eq(task.id, taskAssignee.taskId))
    .leftJoin(client, eq(client.id, task.clientId))
    .where(eq(taskAssignee.teamMemberId, member.id))
    .orderBy(asc(task.dueDate))) as unknown as Row[];

  const today = todayJakarta();
  const weekAhead = ymdOffset(7);

  const active = rows.filter((r) => !isDone(r.status));
  const overdue = active.filter((r) => r.dueDate && r.dueDate < today);
  const thisWeek = active.filter(
    (r) => r.dueDate && r.dueDate >= today && r.dueDate <= weekAhead,
  );
  const later = active.filter((r) => r.dueDate && r.dueDate > weekAhead);
  const noDue = active.filter((r) => !r.dueDate);
  const done = rows.filter((r) => isDone(r.status));

  const firstName = member.name.split(" ")[0];

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
          <Section title="⚠️ Lewat deadline" count={overdue.length} tone="bg-red-100 text-red-700">
            {overdue.map((t) => (
              <TaskRow key={t.id} t={t} tone="text-red-600 font-medium" />
            ))}
          </Section>
          <Section title="Minggu ini" count={thisWeek.length} tone="bg-amber-100 text-amber-700">
            {thisWeek.map((t) => (
              <TaskRow key={t.id} t={t} tone="text-amber-600" />
            ))}
          </Section>
          <Section title="Nanti" count={later.length}>
            {later.map((t) => (
              <TaskRow key={t.id} t={t} />
            ))}
          </Section>
          <Section title="Tanpa deadline" count={noDue.length}>
            {noDue.map((t) => (
              <TaskRow key={t.id} t={t} />
            ))}
          </Section>
          <Section title="Selesai" count={done.length} tone="bg-green-100 text-green-700">
            {done.slice(0, 10).map((t) => (
              <TaskRow key={t.id} t={t} />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}
