"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appSetting } from "@/db/schema";
import { SECRET_SETTING_KEYS } from "@/lib/config";
import { encryptSecret } from "@/lib/crypto";
import { requireAdmin } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveSettings(
  values: Record<string, string>,
): Promise<ActionResult> {
  await requireAdmin();
  for (const [key, raw] of Object.entries(values)) {
    // Tokens are encrypted at rest; flags/non-secrets stored as-is.
    const value = SECRET_SETTING_KEYS.has(key) ? encryptSecret(raw) : raw;
    await db
      .insert(appSetting)
      .values({ key, value })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value, updatedAt: new Date() },
      });
  }
  revalidatePath("/settings");
  revalidatePath("/performance");
  return { ok: true };
}
