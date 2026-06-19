"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { kolActivation } from "@/db/schema";
import { requireSession } from "@/lib/session";

const KOL_STATUSES = [
  "belum_bales_dm",
  "sudah_bales_dm",
  "minta_rate_card",
  "nego",
  "deal",
  "mau_datang_review",
  "sudah_posting",
  "sudah_review",
  "cancel",
] as const;

const optInt = z.coerce.number().int().min(0).nullish();
const optNum = z.coerce.number().min(0).nullish();
const reqInt = z.coerce.number().int().min(0).default(0);
const reqNum = z.coerce.number().min(0).default(0);

const kolInput = z.object({
  clientId: z.string().uuid("Klien wajib dipilih"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Periode wajib format YYYY-MM"),
  status: z.enum(KOL_STATUSES),
  username: z.string().trim().min(1, "Username wajib diisi"),
  igLink: z.string().trim().nullish(),
  igFollowers: optInt,
  igEr: optNum,
  tiktokLink: z.string().trim().nullish(),
  tiktokFollowers: optInt,
  tiktokEr: optNum,
  placement: z.string().trim().nullish(),
  linkPost: z.string().trim().nullish(),
  datePost: z.string().trim().nullish(),
  fee: reqNum,
  productCost: reqNum,
  reach: reqInt,
  impressions: reqInt,
  likes: reqInt,
  comments: reqInt,
  shares: reqInt,
  saves: reqInt,
  notes: z.string().trim().nullish(),
});

export type KolInput = z.infer<typeof kolInput>;
export type ActionResult = { ok: true } | { ok: false; error: string };

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid";
}

const str = (v: number | null | undefined) =>
  v === null || v === undefined ? null : String(v);

function toValues(input: KolInput) {
  return {
    clientId: input.clientId,
    period: input.period,
    status: input.status,
    username: input.username,
    igLink: input.igLink || null,
    igFollowers: input.igFollowers ?? null,
    igEr: str(input.igEr),
    tiktokLink: input.tiktokLink || null,
    tiktokFollowers: input.tiktokFollowers ?? null,
    tiktokEr: str(input.tiktokEr),
    placement: input.placement || null,
    linkPost: input.linkPost || null,
    datePost: input.datePost || null,
    fee: String(input.fee),
    productCost: String(input.productCost),
    reach: input.reach,
    impressions: input.impressions,
    likes: input.likes,
    comments: input.comments,
    shares: input.shares,
    saves: input.saves,
    notes: input.notes || null,
  };
}

export async function createKol(raw: KolInput): Promise<ActionResult> {
  await requireSession();
  const parsed = kolInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  await db.insert(kolActivation).values(toValues(parsed.data));
  revalidatePath("/kol");
  revalidatePath("/performance");
  return { ok: true };
}

export async function updateKol(
  id: string,
  raw: KolInput,
): Promise<ActionResult> {
  await requireSession();
  const parsed = kolInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  await db
    .update(kolActivation)
    .set({ ...toValues(parsed.data), updatedAt: new Date() })
    .where(eq(kolActivation.id, id));
  revalidatePath("/kol");
  revalidatePath("/performance");
  return { ok: true };
}

export async function deleteKol(id: string): Promise<ActionResult> {
  await requireSession();
  await db.delete(kolActivation).where(eq(kolActivation.id, id));
  revalidatePath("/kol");
  revalidatePath("/performance");
  return { ok: true };
}

/** Quick status move (used by the pipeline board drag-drop). */
export async function setKolStatus(
  id: string,
  status: KolInput["status"],
): Promise<ActionResult> {
  await requireSession();
  if (!KOL_STATUSES.includes(status)) {
    return { ok: false, error: "Status tidak valid" };
  }
  await db
    .update(kolActivation)
    .set({ status, updatedAt: new Date() })
    .where(eq(kolActivation.id, id));
  revalidatePath("/kol");
  revalidatePath("/performance");
  return { ok: true };
}
