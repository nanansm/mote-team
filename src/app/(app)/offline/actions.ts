"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { offlineMetric } from "@/db/schema";
import { requireSession } from "@/lib/session";

const input = z.object({
  clientId: z.string().uuid("Klien wajib dipilih"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Periode wajib format YYYY-MM"),
  targetOmset: z.coerce.number().min(0).default(0),
  revenue: z.coerce.number().min(0).default(0),
  numberOfBill: z.coerce.number().int().min(0).default(0),
  pageView: z.coerce.number().int().min(0).nullish(),
  clickOta: z.coerce.number().int().min(0).nullish(),
  clickWhatsapp: z.coerce.number().int().min(0).nullish(),
  conversionOnline: z.coerce.number().int().min(0).nullish(),
  revenueOnline: z.coerce.number().min(0).nullish(),
  notes: z.string().trim().nullish(),
});

export type RevenueInput = z.infer<typeof input>;
export type ActionResult = { ok: true } | { ok: false; error: string };

/** Upsert the single revenue row for a client + month. */
export async function saveRevenue(raw: RevenueInput): Promise<ActionResult> {
  await requireSession();
  const parsed = input.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const v = parsed.data;
  const values = {
    targetOmset: String(v.targetOmset),
    revenue: String(v.revenue),
    numberOfBill: v.numberOfBill,
    pageView: v.pageView ?? null,
    clickOta: v.clickOta ?? null,
    clickWhatsapp: v.clickWhatsapp ?? null,
    conversionOnline: v.conversionOnline ?? null,
    revenueOnline: v.revenueOnline != null ? String(v.revenueOnline) : null,
    notes: v.notes ? v.notes : null,
  };

  const existing = await db
    .select({ id: offlineMetric.id })
    .from(offlineMetric)
    .where(
      and(
        eq(offlineMetric.clientId, v.clientId),
        eq(offlineMetric.period, v.period),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(offlineMetric)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(offlineMetric.id, existing[0].id));
  } else {
    await db
      .insert(offlineMetric)
      .values({ clientId: v.clientId, period: v.period, ...values });
  }
  revalidatePath("/offline");
  revalidatePath("/pulse");
  return { ok: true };
}
