import { asc, eq, inArray } from "drizzle-orm";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { client, task, taskAssignee, teamMember } from "@/db/schema";
import { getMemberFor } from "@/lib/member";
import { requireSession } from "@/lib/session";
import type { TaskStatus, TypeContent } from "@/lib/task-meta";
import type { Assignee, TaskRow } from "../tasks/types";
import { MyTasksView } from "./my-tasks-view";

export const dynamic = "force-dynamic";

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

  const [taskRows, clients, members] = await Promise.all([
    db
      .select({
        id: task.id,
        title: task.title,
        status: task.status,
        clientId: task.clientId,
        clientName: client.name,
        brandColor: client.color,
        parentId: task.parentId,
        dueDate: task.dueDate,
        postingDate: task.postingDate,
        typeContent: task.typeContent,
        caption: task.caption,
        linkMateri: task.linkMateri,
        linkOutput: task.linkOutput,
        linkIg: task.linkIg,
        linkTiktok: task.linkTiktok,
        mediaUrl: task.mediaUrl,
        sortOrder: task.sortOrder,
      })
      .from(taskAssignee)
      .innerJoin(task, eq(task.id, taskAssignee.taskId))
      .leftJoin(client, eq(client.id, task.clientId))
      .where(eq(taskAssignee.teamMemberId, member.id))
      .orderBy(asc(task.dueDate)),
    db
      .select({ id: client.id, name: client.name })
      .from(client)
      .where(eq(client.status, "active"))
      .orderBy(asc(client.name)),
    db
      .select({ id: teamMember.id, name: teamMember.name })
      .from(teamMember)
      .where(eq(teamMember.active, true))
      .orderBy(asc(teamMember.name)),
  ]);

  // All assignees for these tasks (a task may have several) — for the detail sheet.
  const ids = taskRows.map((t) => t.id);
  const assigneeRows = ids.length
    ? await db
        .select({
          taskId: taskAssignee.taskId,
          memberId: teamMember.id,
          memberName: teamMember.name,
        })
        .from(taskAssignee)
        .innerJoin(teamMember, eq(taskAssignee.teamMemberId, teamMember.id))
        .where(inArray(taskAssignee.taskId, ids))
    : [];

  const byTask = new Map<string, Assignee[]>();
  for (const a of assigneeRows) {
    const list = byTask.get(a.taskId) ?? [];
    list.push({ id: a.memberId, name: a.memberName });
    byTask.set(a.taskId, list);
  }

  const tasks: TaskRow[] = taskRows.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as TaskStatus,
    clientId: t.clientId,
    clientName: t.clientName ?? "—",
    brandColor: t.brandColor,
    parentId: t.parentId,
    dueDate: t.dueDate,
    postingDate: t.postingDate,
    typeContent: t.typeContent as TypeContent | null,
    caption: t.caption,
    linkMateri: t.linkMateri,
    linkOutput: t.linkOutput,
    linkIg: t.linkIg,
    linkTiktok: t.linkTiktok,
    mediaUrl: t.mediaUrl,
    sortOrder: t.sortOrder,
    assignees: byTask.get(t.id) ?? [],
  }));

  return (
    <MyTasksView
      tasks={tasks}
      clients={clients}
      members={members}
      firstName={member.name.split(" ")[0]}
    />
  );
}
