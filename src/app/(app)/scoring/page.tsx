import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  monthlyPerformance,
  okr,
  task,
  taskAssignee,
  teamMember,
} from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { isDone, type TaskStatus } from "@/lib/task-meta";
import { ScoringView, type ScoreRow } from "./scoring-view";

export const dynamic = "force-dynamic";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ScoringPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAdmin();
  const { month: monthParam } = await searchParams;
  const month = monthParam || currentMonth();

  const [members, taskRows, okrRows, mpRows] = await Promise.all([
    db
      .select({
        id: teamMember.id,
        name: teamMember.name,
        division: teamMember.division,
      })
      .from(teamMember)
      .where(eq(teamMember.active, true))
      .orderBy(asc(teamMember.code)),
    db
      .select({
        memberId: taskAssignee.teamMemberId,
        status: task.status,
        posting: task.postingDate,
      })
      .from(taskAssignee)
      .innerJoin(task, eq(task.id, taskAssignee.taskId)),
    db
      .select({
        memberId: okr.teamMemberId,
        target: okr.target,
        progress: okr.progress,
        period: okr.period,
      })
      .from(okr),
    db
      .select({
        memberId: monthlyPerformance.teamMemberId,
        initiative: monthlyPerformance.scoreInitiative,
      })
      .from(monthlyPerformance)
      .where(eq(monthlyPerformance.month, month)),
  ]);

  const tasksByMember = new Map<string, { total: number; done: number }>();
  for (const t of taskRows) {
    if (!t.memberId || !t.posting?.startsWith(month)) continue;
    const e = tasksByMember.get(t.memberId) ?? { total: 0, done: 0 };
    e.total += 1;
    if (isDone(t.status as TaskStatus)) e.done += 1;
    tasksByMember.set(t.memberId, e);
  }

  const okrByMember = new Map<string, number[]>();
  for (const o of okrRows) {
    if (!o.memberId || o.period !== month) continue;
    const target = Number(o.target ?? 0);
    if (target <= 0) continue;
    const pct = Math.min(Number(o.progress ?? 0) / target, 1) * 100;
    const list = okrByMember.get(o.memberId) ?? [];
    list.push(pct);
    okrByMember.set(o.memberId, list);
  }

  const initiativeByMember = new Map<string, number>();
  for (const m of mpRows) {
    if (m.memberId) initiativeByMember.set(m.memberId, Number(m.initiative ?? 0));
  }

  const rows: ScoreRow[] = members.map((m) => {
    const t = tasksByMember.get(m.id);
    const completion = t && t.total > 0 ? Math.round((t.done / t.total) * 100) : null;
    const okrs = okrByMember.get(m.id);
    const okrAvg = okrs?.length
      ? Math.round(okrs.reduce((s, v) => s + v, 0) / okrs.length)
      : null;
    const initiative = initiativeByMember.get(m.id) ?? 0;

    const parts: [number, number][] = [];
    if (completion !== null) parts.push([50, completion]);
    if (okrAvg !== null) parts.push([30, okrAvg]);
    parts.push([20, initiative]);
    const wsum = parts.reduce((s, [w]) => s + w, 0);
    const total = Math.round(
      parts.reduce((s, [w, v]) => s + w * v, 0) / wsum,
    );

    return {
      id: m.id,
      name: m.name,
      division: m.division,
      completion,
      okrAvg,
      initiative,
      taskCount: t?.total ?? 0,
      total,
    };
  });

  // Months available for the selector.
  const monthSet = new Set<string>([month, currentMonth()]);
  for (const t of taskRows) if (t.posting) monthSet.add(t.posting.slice(0, 7));
  const months = [...monthSet].sort().reverse();

  return <ScoringView rows={rows} month={month} months={months} />;
}
