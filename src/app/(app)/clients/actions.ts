"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { client } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { listIgAccounts, type IgAccount } from "@/lib/instagram";
import { listReplizTiktokAccounts, type ReplizAccount } from "@/lib/repliz";
import { listGmbLocations, type GmbLocation } from "@/lib/gmb";
import { listMetaAdAccounts, type MetaAdAccount } from "@/lib/meta";

const clientInput = z.object({
  name: z.string().trim().min(1, "Nama klien wajib diisi"),
  status: z.enum(["active", "on_hold", "offboarding"]),
  contractEnd: z.string().trim().nullish(),
  logoUrl: z.string().trim().nullish(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus kode hex #rrggbb")
    .nullish()
    .or(z.literal("")),
  igUserId: z.string().trim().nullish(),
  replizAccountId: z.string().trim().nullish(),
  gmbLocationId: z.string().trim().nullish(),
  tiktokFollowers: z.coerce.number().int().min(0).nullable().optional(),
  metaAdAccountId: z.string().trim().nullish(),
  notes: z.string().trim().max(10000, "Catatan terlalu panjang").nullish(),
});

export type ClientInput = z.infer<typeof clientInput>;
export type ActionResult = { ok: true } | { ok: false; error: string };

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid";
}

function toValues(input: ClientInput) {
  // Legacy windsor_* columns are intentionally NOT set here (migrated off
  // Windsor → direct APIs); existing values are left untouched.
  return {
    name: input.name,
    status: input.status,
    contractEnd: input.contractEnd ? input.contractEnd : null,
    logoUrl: input.logoUrl ? input.logoUrl : null,
    color: input.color ? input.color : null,
    igUserId: input.igUserId ? input.igUserId : null,
    replizAccountId: input.replizAccountId ? input.replizAccountId : null,
    gmbLocationId: input.gmbLocationId ? input.gmbLocationId : null,
    tiktokFollowers: input.tiktokFollowers ?? null,
    metaAdAccountId: input.metaAdAccountId ? input.metaAdAccountId : null,
    notes: input.notes ? input.notes : null,
  };
}

export type ConnectorOptions = {
  ig: IgAccount[];
  tiktok: ReplizAccount[];
  gmb: GmbLocation[];
  meta: MetaAdAccount[];
};

/**
 * Live connector accounts for the client form dropdowns. Each source returns
 * [] when unconfigured/down, so the form degrades to a disabled select with a
 * hint rather than breaking.
 */
export async function getConnectorOptions(): Promise<ConnectorOptions> {
  await requireSession();
  const [ig, tiktok, gmb, meta] = await Promise.all([
    listIgAccounts(),
    listReplizTiktokAccounts(),
    listGmbLocations(),
    listMetaAdAccounts(),
  ]);
  return { ig, tiktok, gmb, meta };
}

export async function createClient(raw: ClientInput): Promise<ActionResult> {
  await requireSession();
  const parsed = clientInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  await db.insert(client).values(toValues(parsed.data));
  revalidatePath("/clients");
  return { ok: true };
}

export async function updateClient(
  id: string,
  raw: ClientInput,
): Promise<ActionResult> {
  await requireSession();
  const parsed = clientInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  await db
    .update(client)
    .set({ ...toValues(parsed.data), updatedAt: new Date() })
    .where(eq(client.id, id));
  revalidatePath("/clients");
  return { ok: true };
}

export async function deleteClient(id: string): Promise<ActionResult> {
  await requireSession();
  await db.delete(client).where(eq(client.id, id));
  revalidatePath("/clients");
  return { ok: true };
}

export async function setClientStatus(
  id: string,
  status: "active" | "on_hold" | "offboarding",
): Promise<ActionResult> {
  await requireSession();
  await db
    .update(client)
    .set({ status, updatedAt: new Date() })
    .where(eq(client.id, id));
  revalidatePath("/clients");
  revalidatePath("/dashboard");
  revalidatePath("/performance");
  return { ok: true };
}
