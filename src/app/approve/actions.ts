"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { task } from "@/db/schema";

const schema = z.object({
  token: z.string().min(1),
  decision: z.enum(["approved", "revision"]),
  note: z.string().trim().max(2000).optional(),
});

export type ApprovalResult = { ok: true } | { ok: false; error: string };

/**
 * Public (no-auth) approval submission. Token-gated: the caller must know the
 * task's approval token. Sets approvalStatus + optional revision note.
 */
export async function submitApproval(
  input: z.infer<typeof schema>,
): Promise<ApprovalResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Input tidak valid" };
  const { token, decision, note } = parsed.data;

  const rows = await db
    .select({ id: task.id })
    .from(task)
    .where(eq(task.approvalToken, token))
    .limit(1);
  if (!rows[0]) return { ok: false, error: "Link approval tidak valid" };

  if (decision === "revision" && !note) {
    return { ok: false, error: "Catatan revisi wajib diisi" };
  }

  await db
    .update(task)
    .set({ approvalStatus: decision, approvalNote: note ? note : null })
    .where(eq(task.id, rows[0].id));
  revalidatePath(`/approve/${token}`);
  return { ok: true };
}
