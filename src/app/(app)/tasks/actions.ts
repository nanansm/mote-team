"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { client, task, taskAssignee, teamMember, user } from "@/db/schema";
import { env } from "@/lib/env";
import { sendMail, taskAssignedEmail } from "@/lib/mailer";
import { TASK_STATUS_MAP, type TaskStatus } from "@/lib/task-meta";
import { requireSession } from "@/lib/session";

/** Best-effort assignment notification — never blocks the action. */
async function notifyAssignees(
  taskId: string,
  assigneeIds: string[],
  info: { title: string; clientId: string; status: string; dueDate: string | null },
) {
  if (assigneeIds.length === 0) return;
  try {
    const [recipients, clientRow] = await Promise.all([
      db
        .select({
          email: teamMember.email,
          userEmail: user.email,
        })
        .from(teamMember)
        .leftJoin(user, eq(teamMember.authUserId, user.id))
        .where(inArray(teamMember.id, assigneeIds)),
      db
        .select({ name: client.name })
        .from(client)
        .where(eq(client.id, info.clientId))
        .limit(1),
    ]);
    const emails = recipients
      .map((r) => r.email ?? r.userEmail)
      .filter((e): e is string => Boolean(e));
    if (emails.length === 0) return;

    const statusLabel =
      TASK_STATUS_MAP[info.status as TaskStatus]?.label ?? info.status;
    await sendMail({
      to: emails,
      subject: `Task baru: ${info.title}`,
      html: taskAssignedEmail({
        taskTitle: info.title,
        clientName: clientRow[0]?.name ?? "—",
        status: statusLabel,
        dueDate: info.dueDate,
        url: `${env.APP_URL}/tasks`,
      }),
    });
  } catch (e) {
    console.error("[notifyAssignees] failed:", e);
  }
}

const taskInput = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi"),
  clientId: z.uuid("Klien wajib dipilih"),
  status: z.enum([
    "not_started",
    "in_progress",
    "done",
    "ready",
    "scheduled",
    "published",
  ]),
  parentId: z.uuid().nullish(),
  dueDate: z.string().trim().nullish(),
  postingDate: z.string().trim().nullish(),
  typeContent: z.enum(["carousel", "reels"]).nullish(),
  caption: z.string().trim().nullish(),
  linkMateri: z.string().trim().nullish(),
  linkOutput: z.string().trim().nullish(),
  linkIg: z.string().trim().nullish(),
  linkTiktok: z.string().trim().nullish(),
  mediaUrl: z.string().trim().nullish(),
  assigneeIds: z.array(z.uuid()).default([]),
});

export type TaskInput = z.infer<typeof taskInput>;
export type ActionResult = { ok: true } | { ok: false; error: string };

function nz(v: string | null | undefined): string | null {
  return v ? v : null;
}

function toValues(input: TaskInput) {
  return {
    title: input.title,
    clientId: input.clientId,
    status: input.status,
    parentId: input.parentId ?? null,
    dueDate: nz(input.dueDate),
    postingDate: nz(input.postingDate),
    typeContent: input.typeContent ?? null,
    caption: nz(input.caption),
    linkMateri: nz(input.linkMateri),
    linkOutput: nz(input.linkOutput),
    linkIg: nz(input.linkIg),
    linkTiktok: nz(input.linkTiktok),
    mediaUrl: nz(input.mediaUrl),
  };
}

async function currentMemberId(authUserId: string): Promise<string | null> {
  const [m] = await db
    .select({ id: teamMember.id })
    .from(teamMember)
    .where(eq(teamMember.authUserId, authUserId))
    .limit(1);
  return m?.id ?? null;
}

export async function createTask(raw: TaskInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = taskInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };

  const createdBy = await currentMemberId(session.user.id);
  const assignees = parsed.data.assigneeIds;

  let newId = "";
  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(task)
      .values({ ...toValues(parsed.data), createdBy })
      .returning({ id: task.id });
    newId = row.id;
    if (assignees.length) {
      await tx
        .insert(taskAssignee)
        .values(assignees.map((teamMemberId) => ({ taskId: row.id, teamMemberId })));
    }
  });

  await notifyAssignees(newId, assignees, {
    title: parsed.data.title,
    clientId: parsed.data.clientId,
    status: parsed.data.status,
    dueDate: parsed.data.dueDate ?? null,
  });

  revalidatePath("/tasks");
  return { ok: true };
}

export async function updateTask(
  id: string,
  raw: TaskInput,
): Promise<ActionResult> {
  await requireSession();
  const parsed = taskInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };

  // A task cannot be its own parent.
  const parentId = parsed.data.parentId === id ? null : parsed.data.parentId ?? null;
  const assignees = parsed.data.assigneeIds;

  await db.transaction(async (tx) => {
    await tx
      .update(task)
      .set({ ...toValues(parsed.data), parentId, updatedAt: new Date() })
      .where(eq(task.id, id));
    await tx.delete(taskAssignee).where(eq(taskAssignee.taskId, id));
    if (assignees.length) {
      await tx
        .insert(taskAssignee)
        .values(assignees.map((teamMemberId) => ({ taskId: id, teamMemberId })));
    }
  });

  revalidatePath("/tasks");
  return { ok: true };
}

export async function updateTaskStatus(
  id: string,
  status: TaskInput["status"],
): Promise<ActionResult> {
  await requireSession();
  await db
    .update(task)
    .set({ status, updatedAt: new Date() })
    .where(eq(task.id, id));
  revalidatePath("/tasks");
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  await requireSession();
  await db.delete(task).where(eq(task.id, id));
  revalidatePath("/tasks");
  return { ok: true };
}
