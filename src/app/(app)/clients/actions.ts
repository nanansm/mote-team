"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { client } from "@/db/schema";
import { requireSession } from "@/lib/session";

const clientInput = z.object({
  name: z.string().trim().min(1, "Nama klien wajib diisi"),
  status: z.enum(["active", "on_hold", "offboarding"]),
  contractEnd: z.string().trim().nullish(),
  logoUrl: z.string().trim().nullish(),
  windsorAccountId: z.string().trim().nullish(),
  windsorTiktokId: z.string().trim().nullish(),
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
  };
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
