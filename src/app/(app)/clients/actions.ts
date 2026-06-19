"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { client } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { listWindsorAccounts } from "@/lib/windsor";
import { listMetaAdAccounts, type MetaAdAccount } from "@/lib/meta";

const clientInput = z.object({
  name: z.string().trim().min(1, "Nama klien wajib diisi"),
  status: z.enum(["active", "on_hold", "offboarding"]),
  contractEnd: z.string().trim().nullish(),
  logoUrl: z.string().trim().nullish(),
  windsorAccountId: z.string().trim().nullish(),
  windsorTiktokId: z.string().trim().nullish(),
  windsorGmbId: z.string().trim().nullish(),
  metaAdAccountId: z.string().trim().nullish(),
  notes: z.string().trim().max(10000, "Catatan terlalu panjang").nullish(),
});

export type ClientInput = z.infer<typeof clientInput>;
export type ActionResult = { ok: true } | { ok: false; error: string };

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Input tidak valid";
}

function toValues(input: ClientInput) {
  return {
    name: input.name,
    status: input.status,
    contractEnd: input.contractEnd ? input.contractEnd : null,
    logoUrl: input.logoUrl ? input.logoUrl : null,
    windsorAccountId: input.windsorAccountId ? input.windsorAccountId : null,
    windsorTiktokId: input.windsorTiktokId ? input.windsorTiktokId : null,
    windsorGmbId: input.windsorGmbId ? input.windsorGmbId : null,
    metaAdAccountId: input.metaAdAccountId ? input.metaAdAccountId : null,
    notes: input.notes ? input.notes : null,
  };
}

export type ConnectorOptions = {
  ig: string[];
  tiktok: string[];
  gmb: string[];
  meta: MetaAdAccount[];
};

/**
 * Live connector accounts for the client form dropdowns. Each source returns
 * [] when unconfigured/down, so the form degrades to a disabled select with a
 * hint rather than breaking.
 */
export async function getConnectorOptions(): Promise<ConnectorOptions> {
  await requireSession();
  const [windsor, meta] = await Promise.all([
    listWindsorAccounts(),
    listMetaAdAccounts(),
  ]);
  return { ig: windsor.ig, tiktok: windsor.tiktok, gmb: windsor.gmb, meta };
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
