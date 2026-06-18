import { desc, eq } from "drizzle-orm";
import {
  AlertTriangle,
  CalendarClock,
  UserX,
  CalendarOff,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { db } from "@/db";
import { client, task, taskAssignee, teamMember } from "@/db/schema";
import { isDone, TASK_STATUS_MAP, type TaskStatus } from "@/lib/task-meta";
import { todayJakarta, ymdOffset } from "@/lib/tz";
import { cn } from "@/lib/utils";

const fmtDate = (v: string | null) =>
  v
    ? new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : "—";

function TaskLine({
  title,
  clientName,
  status,
  due,
  who,
  tone,
}: {
  title: string;
  clientName: string;
  status: TaskStatus;
  due: string | null;
  who?: string;
  tone?: string;
}) {
  const meta = TASK_STATUS_MAP[status];
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {clientName}
          {who ? ` · ${who}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn("text-xs", tone)}>{fmtDate(due)}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", meta.badge)}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}

export async function ControlBoard() {
  // Active-client tasks + their assignees.
  const [rows, assigneeRows] = await Promise.all([
    db
      .select({
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate,
        clientId: task.clientId,
        clientName: client.name,
      })
      .from(task)
      .innerJoin(client, eq(client.id, task.clientId))
      .where(eq(client.status, "active"))
      .orderBy(desc(task.dueDate)),
    db
      .select({
        taskId: taskAssignee.taskId,
        memberName: teamMember.name,
      })
      .from(taskAssignee)
      .innerJoin(teamMember, eq(teamMember.id, taskAssignee.teamMemberId)),
  ]);

  const assigneeMap = new Map<string, string[]>();
  for (const a of assigneeRows) {
    const list = assigneeMap.get(a.taskId) ?? [];
    list.push(a.memberName);
    assigneeMap.set(a.taskId, list);
  }

  const today = todayJakarta();
  const weekAhead = ymdOffset(7);

  const active = rows.filter((r) => !isDone(r.status as TaskStatus));
  const stuck = active.filter((r) => r.dueDate && r.dueDate < today);
  const dueSoon = active.filter(
    (r) => r.dueDate && r.dueDate >= today && r.dueDate <= weekAhead,
  );
  const unassigned = active.filter((r) => !assigneeMap.get(r.id)?.length);
  const noDue = active.filter((r) => !r.dueDate);

  // Workload: active tasks per assignee.
  const load = new Map<string, number>();
  for (const r of active) {
    for (const name of assigneeMap.get(r.id) ?? []) {
      load.set(name, (load.get(name) ?? 0) + 1);
    }
  }
  const workload = [...load.entries()].sort((a, b) => b[1] - a[1]);
  const maxLoad = workload[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Macet (lewat deadline)" value={stuck.length} icon={AlertTriangle} tone="red" />
        <StatCard label="Due minggu ini" value={dueSoon.length} icon={CalendarClock} tone="amber" />
        <StatCard label="Belum ada assignee" value={unassigned.length} icon={UserX} tone="brand" />
        <StatCard label="Tanpa deadline" value={noDue.length} icon={CalendarOff} tone="default" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workload */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Beban per orang</h3>
          <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-card">
            {workload.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Belum ada task aktif yang di-assign.
              </p>
            ) : (
              workload.map(([name, count]) => (
                <div key={name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {count} task aktif
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        count >= 8 ? "bg-red-500" : count >= 5 ? "bg-amber-500" : "bg-primary",
                      )}
                      style={{ width: `${Math.round((count / maxLoad) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Stuck */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">⚠️ Macet — perlu ditindak</h3>
          <div className="space-y-2 rounded-2xl border bg-card p-5 shadow-card">
            {stuck.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Tidak ada task yang lewat deadline. 🎉
              </p>
            ) : (
              stuck
                .slice(0, 12)
                .map((r) => (
                  <TaskLine
                    key={r.id}
                    title={r.title}
                    clientName={r.clientName}
                    status={r.status as TaskStatus}
                    due={r.dueDate}
                    who={assigneeMap.get(r.id)?.join(", ")}
                    tone="text-red-600 font-medium dark:text-red-400"
                  />
                ))
            )}
          </div>
        </section>
      </div>

      {/* Hygiene */}
      {(unassigned.length > 0 || noDue.length > 0) && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Perlu dirapikan</h3>
          <div className="grid gap-2 rounded-2xl border bg-card p-5 shadow-card sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Belum ada assignee ({unassigned.length})
              </p>
              {unassigned.slice(0, 6).map((r) => (
                <TaskLine
                  key={r.id}
                  title={r.title}
                  clientName={r.clientName}
                  status={r.status as TaskStatus}
                  due={r.dueDate}
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Tanpa deadline ({noDue.length})
              </p>
              {noDue.slice(0, 6).map((r) => (
                <TaskLine
                  key={r.id}
                  title={r.title}
                  clientName={r.clientName}
                  status={r.status as TaskStatus}
                  due={r.dueDate}
                  who={assigneeMap.get(r.id)?.join(", ")}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
