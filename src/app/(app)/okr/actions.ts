"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { okr } from "@/db/schema";
import { requireSession } from "@/lib/session";

const okrInput = z.object({
  objective: z.string().trim().min(1, "Objective wajib diisi"),
  keyResult: z.string().trim().nullish(),
  clientId: z.union([z.uuid(), z.literal("")]).nullish(),
  period: z.string().trim().min(1, "Periode wajib diisi"), // e.g. 2026-06
  target: z.coerce.number().nonnegative().default(0),
  progress: z.coerce.number().nonnegative().default(0),
});

export type OkrInput = z.infer<typeof okrInput>;
export type ActionResult = { ok: true } | { ok: false; error: string };

function toValues(input: OkrInput) {
  return {
    objective: input.objective,
    keyResult: input.keyResult ? input.keyResult : null,
    clientId: input.clientId ? input.clientId : null,
    period: input.period,
    target: String(input.target),
    progress: String(input.progress),
  };
}

export async function createOkr(raw: OkrInput): Promise<ActionResult> {
  await requireSession();
  const parsed = okrInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  await db.insert(okr).values(toValues(parsed.data));
  revalidatePath("/okr");
  return { ok: true };
}

export async function updateOkr(id: string, raw: OkrInput): Promise<ActionResult> {
  await requireSession();
  const parsed = okrInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  await db
    .update(okr)
    .set({ ...toValues(parsed.data), updatedAt: new Date() })
    .where(eq(okr.id, id));
  revalidatePath("/okr");
  return { ok: true };
}

export async function deleteOkr(id: string): Promise<ActionResult> {
  await requireSession();
  await db.delete(okr).where(eq(okr.id, id));
  revalidatePath("/okr");
  return { ok: true };
}
