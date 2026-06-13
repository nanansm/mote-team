"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { monthlyPerformance } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Set the manual "score initiative" (0–100) for a member in a month. */
export async function setInitiative(
  teamMemberId: string,
  month: string,
  value: number,
): Promise<ActionResult> {
  await requireAdmin();
  const v = Math.max(0, Math.min(100, Math.round(value)));

  const [existing] = await db
    .select({ id: monthlyPerformance.id })
    .from(monthlyPerformance)
    .where(
      and(
        eq(monthlyPerformance.teamMemberId, teamMemberId),
        eq(monthlyPerformance.month, month),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(monthlyPerformance)
      .set({ scoreInitiative: String(v), updatedAt: new Date() })
      .where(eq(monthlyPerformance.id, existing.id));
  } else {
    await db.insert(monthlyPerformance).values({
      month,
      teamMemberId,
      scoreInitiative: String(v),
    });
  }

  revalidatePath("/scoring");
  return { ok: true };
}
