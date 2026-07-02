import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { client, task, taskAssignee, teamMember } from "@/db/schema";
import type { TaskStatus, TypeContent } from "@/lib/task-meta";
import { TasksView } from "./tasks-view";
import type { Assignee, TaskRow } from "./types";

export default async function TasksPage() {
  const [clients, members, taskRows, assigneeRows] = await Promise.all([
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
        createdAt: task.createdAt,
      })
      .from(task)
      .leftJoin(client, eq(task.clientId, client.id))
      .orderBy(desc(task.createdAt)),
    db
      .select({
        taskId: taskAssignee.taskId,
        memberId: teamMember.id,
        memberName: teamMember.name,
      })
      .from(taskAssignee)
      .innerJoin(teamMember, eq(taskAssignee.teamMemberId, teamMember.id)),
  ]);

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
    assignees: byTask.get(t.id) ?? [],
  }));

  return <TasksView tasks={tasks} clients={clients} members={members} />;
}
