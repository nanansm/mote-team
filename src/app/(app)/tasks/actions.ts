"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  client,
  task,
  taskAssignee,
  taskComment,
  teamMember,
  user,
} from "@/db/schema";
import { env } from "@/lib/env";
import { sendMail, taskAssignedEmail } from "@/lib/mailer";
import { sendWhatsApp, taskAssignedWa } from "@/lib/whatsapp";
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
          name: teamMember.name,
          email: teamMember.email,
          phone: teamMember.phone,
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
    const clientName = clientRow[0]?.name ?? "—";
    const url = `${env.APP_URL}/tasks`;

    // Email — one batch to all assignees with an address.
    const emails = recipients
      .map((r) => r.email ?? r.userEmail)
      .filter((e): e is string => Boolean(e));
    if (emails.length > 0) {
      const statusLabel =
        TASK_STATUS_MAP[info.status as TaskStatus]?.label ?? info.status;
      await sendMail({
        to: emails,
        subject: `Task baru: ${info.title}`,
        html: taskAssignedEmail({
          taskTitle: info.title,
          clientName,
          status: statusLabel,
          dueDate: info.dueDate,
          url,
        }),
      });
    }

    // WhatsApp — personalized per assignee that has a number (independent of email).
    await Promise.all(
      recipients
        .filter((r) => r.phone)
        .map(async (r) =>
          sendWhatsApp(
            r.phone,
            await taskAssignedWa({
              name: r.name,
              taskTitle: info.title,
              clientName,
              dueDate: info.dueDate,
              url,
            }),
          ),
        ),
    );
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

  // Who was already assigned — so we only notify the people newly added here
  // (re-notifying everyone on every edit would spam).
  const existing = await db
    .select({ id: taskAssignee.teamMemberId })
    .from(taskAssignee)
    .where(eq(taskAssignee.taskId, id));
  const existingIds = new Set(existing.map((e) => e.id));
  const newlyAdded = assignees.filter((a) => !existingIds.has(a));

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

  await notifyAssignees(id, newlyAdded, {
    title: parsed.data.title,
    clientId: parsed.data.clientId,
    status: parsed.data.status,
    dueDate: parsed.data.dueDate ?? null,
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

/* ------------------------------------------------- command palette search */

export type TaskOption = { id: string; title: string; clientName: string | null };

/** Lightweight task list for the command palette — fetched lazily on first open. */
export async function listTaskOptions(): Promise<TaskOption[]> {
  await requireSession();
  return db
    .select({
      id: task.id,
      title: task.title,
      clientName: client.name,
    })
    .from(task)
    .leftJoin(client, eq(task.clientId, client.id))
    .orderBy(desc(task.createdAt))
    .limit(500);
}

/* --------------------------------------------------------------- comments */

export type TaskCommentRow = {
  id: string;
  body: string;
  createdAt: string; // ISO
  authorName: string;
  canDelete: boolean;
};

export async function listComments(taskId: string): Promise<TaskCommentRow[]> {
  const session = await requireSession();
  const isAdmin = session.user.role === "admin";
  const rows = await db
    .select({
      id: taskComment.id,
      body: taskComment.body,
      createdAt: taskComment.createdAt,
      authorUserId: taskComment.authorUserId,
      authorName: user.name,
    })
    .from(taskComment)
    .leftJoin(user, eq(taskComment.authorUserId, user.id))
    .where(eq(taskComment.taskId, taskId))
    .orderBy(desc(taskComment.createdAt));

  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    authorName: r.authorName ?? "Anggota",
    canDelete: isAdmin || r.authorUserId === session.user.id,
  }));
}

export async function addComment(
  taskId: string,
  body: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!z.uuid().safeParse(taskId).success)
    return { ok: false, error: "Task tidak valid" };
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Komentar kosong" };
  if (trimmed.length > 4000)
    return { ok: false, error: "Komentar terlalu panjang" };
  // Guard against a deleted task → clean error instead of an opaque FK throw.
  const [exists] = await db
    .select({ id: task.id })
    .from(task)
    .where(eq(task.id, taskId))
    .limit(1);
  if (!exists) return { ok: false, error: "Task sudah dihapus" };
  await db
    .insert(taskComment)
    .values({ taskId, body: trimmed, authorUserId: session.user.id });
  revalidatePath("/tasks");
  return { ok: true };
}

export async function deleteComment(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const isAdmin = session.user.role === "admin";
  const [row] = await db
    .select({ authorUserId: taskComment.authorUserId })
    .from(taskComment)
    .where(eq(taskComment.id, id))
    .limit(1);
  if (!row) return { ok: false, error: "Komentar tak ditemukan" };
  if (!isAdmin && row.authorUserId !== session.user.id)
    return { ok: false, error: "Tidak boleh menghapus komentar ini" };
  await db.delete(taskComment).where(eq(taskComment.id, id));
  revalidatePath("/tasks");
  return { ok: true };
}

/**
 * Ensure a task has a public approval token and return its shareable link.
 * Generates the token on first call and sets status to "pending".
 */
export async function ensureApprovalLink(
  taskId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireSession();
  const rows = await db
    .select({ token: task.approvalToken })
    .from(task)
    .where(eq(task.id, taskId))
    .limit(1);
  if (!rows[0]) return { ok: false, error: "Task tidak ditemukan" };

  let token = rows[0].token;
  if (!token) {
    token = crypto.randomUUID();
    await db
      .update(task)
      .set({ approvalToken: token, approvalStatus: "pending" })
      .where(eq(task.id, taskId));
    revalidatePath("/tasks");
  }
  return { ok: true, url: `${env.APP_URL}/approve/${token}` };
}
