"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appSetting } from "@/db/schema";
import { getSmtpConfig, SECRET_SETTING_KEYS } from "@/lib/config";
import { encryptSecret } from "@/lib/crypto";
import { sendMail } from "@/lib/mailer";
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

/**
 * Send a test email to the logged-in admin to verify SMTP creds actually
 * authenticate (the "Terhubung" badge only checks that fields are filled, not
 * that Gmail accepts the password). Returns the precise error on failure.
 */
export async function sendTestEmail(): Promise<ActionResult> {
  const session = await requireAdmin();
  const to = session.user.email;
  const c = await getSmtpConfig();
  if (!c.host || !c.user || !c.password) {
    return { ok: false, error: "SMTP belum lengkap (host/user/password)." };
  }
  const ok = await sendMail({
    to,
    subject: "Test SMTP — Mote Team",
    html: `<p>Kalau email ini masuk, SMTP Mote Team sudah benar.</p><p style="color:#6b7280;font-size:12px">Dikirim dari ${c.fromEmail || c.user} via ${c.host}.</p>`,
  });
  return ok
    ? { ok: true }
    : {
        ok: false,
        error: `Gagal kirim ke ${to}. Cek log server — biasanya app-password Gmail salah / 2FA belum aktif.`,
      };
}
