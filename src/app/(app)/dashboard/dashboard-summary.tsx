import { and, desc, eq, sql } from "drizzle-orm";
import { AlertTriangle, CalendarClock, CheckCircle2, ListTodo, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { db } from "@/db";
import { client, task, taskAssignee, teamMember } from "@/db/schema";
import { TASK_STATUSES, isDone, type TaskStatus } from "@/lib/task-meta";
import { firstOfMonth, jakartaParts, todayJakarta, ymdOffset } from "@/lib/tz";
import { cn } from "@/lib/utils";

export async function DashboardSummary() {
  const today = todayJakarta();
  const weekAhead = ymdOffset(7);

  // Current month bounds (WIB) for the team-capacity rollup.
  const nowParts = jakartaParts();
  const monthStart = firstOfMonth(nowParts.year, nowParts.month);
  const lastDay = new Date(nowParts.year, nowParts.month, 0).getDate();
  const monthEnd = `${monthStart.slice(0, 8)}${String(lastDay).padStart(2, "0")}`;
  const inMonth = sql`((${task.postingDate} >= ${monthStart} and ${task.postingDate} <= ${monthEnd}) or (${task.dueDate} >= ${monthStart} and ${task.dueDate} <= ${monthEnd}))`;

  // Aggregate in SQL so this scales with task count (a few status rows + one
  // row per active client, instead of every task transferred to JS).
  const [statusRows, perClientRows, capacityRows] = await Promise.all([
    db
      .select({
        status: task.status,
        count: sql<number>`count(*)::int`,
        overdue: sql<number>`count(*) filter (where ${task.dueDate} is not null and ${task.dueDate} < ${today})::int`,
        dueWeek: sql<number>`count(*) filter (where ${task.dueDate} is not null and ${task.dueDate} >= ${today} and ${task.dueDate} <= ${weekAhead})::int`,
      })
      .from(task)
      .groupBy(task.status),
    db
      .select({
        id: client.id,
        name: client.name,
        // DONE_STATUSES = done, published (see lib/task-meta)
        total: sql<number>`count(${task.id})::int`,
        done: sql<number>`count(${task.id}) filter (where ${task.status} in ('done','published'))::int`,
      })
      .from(client)
      .leftJoin(task, eq(task.clientId, client.id))
      .where(eq(client.status, "active"))
      .groupBy(client.id, client.name)
      .orderBy(desc(sql`count(${task.id})`)),
    // Team capacity: active (non-done) tasks per member for the current month.
    db
      .select({
        id: teamMember.id,
        name: teamMember.name,
        active: sql<number>`count(${task.id}) filter (where ${task.status} not in ('done','published'))::int`,
      })
      .from(teamMember)
      .leftJoin(taskAssignee, eq(taskAssignee.teamMemberId, teamMember.id))
      .leftJoin(task, and(eq(task.id, taskAssignee.taskId), inMonth))
      .where(eq(teamMember.active, true))
      .groupBy(teamMember.id, teamMember.name)
      .orderBy(desc(sql`count(${task.id}) filter (where ${task.status} not in ('done','published'))`)),
  ]);

  const activeStatus = statusRows.filter((r) => !isDone(r.status as TaskStatus));
  const total = statusRows.reduce((s, r) => s + r.count, 0);
  const done = statusRows
    .filter((r) => isDone(r.status as TaskStatus))
    .reduce((s, r) => s + r.count, 0);
  const completionPct = total ? Math.round((done / total) * 100) : 0;
  const dueThisWeek = activeStatus.reduce((s, r) => s + r.dueWeek, 0);
  const overdue = activeStatus.reduce((s, r) => s + r.overdue, 0);
  const statusCounts = TASK_STATUSES.map((s) => ({
    ...s,
    count: statusRows.find((r) => r.status === s.value)?.count ?? 0,
  }));
  const perClient = perClientRows.map((c) => ({
    id: c.id,
    name: c.name,
    total: c.total,
    done: c.done,
    pct: c.total ? Math.round((c.done / c.total) * 100) : 0,
  }));
  const maxActive = capacityRows.reduce((m, r) => Math.max(m, r.active), 0);
  const monthLabel = new Date(`${monthStart}T00:00:00`).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Task aktif" value={total - done} icon={ListTodo} tone="brand" />
        <StatCard label="Selesai" value={`${completionPct}%`} icon={CheckCircle2} tone="green" />
        <StatCard label="Due minggu ini" value={dueThisWeek} icon={CalendarClock} tone="amber" />
        <StatCard label="Lewat deadline" value={overdue} icon={AlertTriangle} tone="red" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold">Progress per klien</h3>
            {perClient.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada klien aktif.
              </p>
            ) : (
              <div className="space-y-4">
                {perClient.map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {c.done}/{c.total} ·{" "}
                        <span className="font-medium text-foreground">{c.pct}%</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold">Breakdown status</h3>
            <div className="space-y-2.5">
              {statusCounts.map((s) => (
                <div key={s.value} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={cn("size-2 rounded-full", s.dot)} />
                    {s.label}
                  </span>
                  <span className="font-medium tabular-nums">{s.count}</span>
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between border-t pt-2.5 text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{total}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Distribusi task tim · {monthLabel}</h3>
          </div>
          {capacityRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada anggota tim aktif.
            </p>
          ) : (
            <div className="space-y-3">
              {capacityRows.map((r) => {
                const width = maxActive ? Math.round((r.active / maxActive) * 100) : 0;
                return (
                  <div key={r.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{r.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {r.active} task
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
