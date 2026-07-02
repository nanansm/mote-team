"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { task, taskTemplate } from "@/db/schema";
import { requireSession } from "@/lib/session";
import type { TypeContent } from "@/lib/task-meta";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type TemplateRow = {
  id: string;
  title: string;
  typeContent: TypeContent | null;
  dayOfMonth: number | null;
  caption: string | null;
};

export async function listTemplates(clientId: string): Promise<TemplateRow[]> {
  await requireSession();
  const rows = await db
    .select({
      id: taskTemplate.id,
      title: taskTemplate.title,
      typeContent: taskTemplate.typeContent,
      dayOfMonth: taskTemplate.dayOfMonth,
      caption: taskTemplate.caption,
    })
    .from(taskTemplate)
    .where(eq(taskTemplate.clientId, clientId))
    .orderBy(asc(taskTemplate.dayOfMonth), asc(taskTemplate.sort));
  return rows.map((r) => ({
    ...r,
    typeContent: r.typeContent as TypeContent | null,
  }));
}

const templateInput = z.object({
  clientId: z.uuid(),
  title: z.string().trim().min(1, "Judul wajib diisi").max(200, "Judul terlalu panjang"),
  typeContent: z
    .enum(["ig_post", "ig_slide", "reels", "ig_story", "tiktok", "document", "other"])
    .nullish(),
  dayOfMonth: z.coerce.number().int().min(1).max(31).nullish(),
  caption: z.string().trim().max(4000, "Caption terlalu panjang").nullish(),
});
export type TemplateInput = z.infer<typeof templateInput>;

export async function createTemplate(raw: TemplateInput): Promise<ActionResult> {
  await requireSession();
  const parsed = templateInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  const d = parsed.data;
  await db.insert(taskTemplate).values({
    clientId: d.clientId,
    title: d.title,
    typeContent: d.typeContent ?? null,
    dayOfMonth: d.dayOfMonth ?? null,
    caption: d.caption ? d.caption : null,
  });
  revalidatePath("/templates");
  return { ok: true };
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  await requireSession();
  await db.delete(taskTemplate).where(eq(taskTemplate.id, id));
  revalidatePath("/templates");
  return { ok: true };
}

export type GenerateResult =
  | { ok: true; created: number; skipped: number }
  | { ok: false; error: string };

/** Create tasks for `month` (YYYY-MM) from a client's template rows. */
export async function generateMonth(
  clientId: string,
  month: string,
): Promise<GenerateResult> {
  await requireSession();
  if (!/^\d{4}-\d{2}$/.test(month))
    return { ok: false, error: "Bulan tidak valid" };
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  const rows = await db
    .select()
    .from(taskTemplate)
    .where(eq(taskTemplate.clientId, clientId));
  if (rows.length === 0) return { ok: false, error: "Belum ada baris template" };

  let created = 0;
  let skipped = 0;
  // One transaction so a mid-loop failure rolls back the whole batch (no
  // partially-generated month that re-running could duplicate).
  await db.transaction(async (tx) => {
    for (const r of rows) {
      const day = Math.min(Math.max(r.dayOfMonth ?? 1, 1), daysInMonth);
      const postingDate = `${month}-${String(day).padStart(2, "0")}`;
      // Skip if a task with same client + title + postingDate already exists.
      const [dup] = await tx
        .select({ id: task.id })
        .from(task)
        .where(
          and(
            eq(task.clientId, clientId),
            eq(task.title, r.title),
            eq(task.postingDate, postingDate),
          ),
        )
        .limit(1);
      if (dup) {
        skipped++;
        continue;
      }
      await tx.insert(task).values({
        title: r.title,
        clientId,
        status: "not_started",
        postingDate,
        typeContent: r.typeContent,
        caption: r.caption,
      });
      created++;
    }
  });
  revalidatePath("/tasks");
  revalidatePath("/calendar");
  return { ok: true, created, skipped };
}
