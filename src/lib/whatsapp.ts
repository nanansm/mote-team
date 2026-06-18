/**
 * WhatsApp notifications via a self-hosted Evolution API gateway (v2).
 *
 * Config (base URL / instance / api key) lives in Settings (app_setting),
 * falling back to env. Sends are best-effort: a failure must never block the
 * task action or the cron job that triggered it.
 */
import { getWaConfig, isWaEnabled } from "./config";

/**
 * Normalize an Indonesian phone number to the bare MSISDN Evolution expects
 * (e.g. "628112131496"). Accepts "0822…", "+62 822…", "822…", "62822…".
 * Returns null if there are too few digits to be a real number.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  // "62…" stays as-is.
  if (digits.length < 10) return null;
  return digits;
}

type WaConfig = { baseUrl: string; instance: string; apiKey: string };

async function resolveConfig(): Promise<WaConfig | null> {
  if (!(await isWaEnabled())) return null;
  const { baseUrl, instance, apiKey } = await getWaConfig();
  if (!baseUrl || !instance || !apiKey) return null;
  // Tolerate a pasted dashboard URL by trimming a trailing path/slash.
  const base = baseUrl.replace(/\/+$/, "").replace(/\/manager.*$/, "");
  return { baseUrl: base, instance, apiKey };
}

/** True when WhatsApp is enabled and fully configured. */
export async function isWhatsAppConfigured(): Promise<boolean> {
  return (await resolveConfig()) !== null;
}

/**
 * Send a plain-text WhatsApp message. Returns true on accept (Evolution
 * queues with status PENDING). Never throws — logs and returns false instead.
 */
export async function sendWhatsApp(
  phone: string | null | undefined,
  text: string,
): Promise<boolean> {
  const number = normalizePhone(phone);
  if (!number) return false;
  const cfg = await resolveConfig();
  if (!cfg) return false;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(
      `${cfg.baseUrl}/message/sendText/${encodeURIComponent(cfg.instance)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: cfg.apiKey },
        body: JSON.stringify({ number, text }),
        signal: ctrl.signal,
      },
    );
    if (!res.ok) {
      console.error(`[whatsapp] send to ${number} failed: HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[whatsapp] send failed:", e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/* ----------------------------------------------------------- templates (HRD) */

/** Message sent to an assignee when they get a new task. */
export function taskAssignedWa(p: {
  name: string;
  taskTitle: string;
  clientName: string;
  dueDate: string | null;
  url: string;
}): string {
  return [
    `Halo ${p.name} 👋`,
    ``,
    `Ada task baru buat kamu dari tim Mote:`,
    `📌 ${p.taskTitle}`,
    `🏢 Klien: ${p.clientName}`,
    `🗓️ Deadline: ${p.dueDate ?? "—"}`,
    ``,
    `Tolong dicek & dikerjakan ya 🙏`,
    `Buka: ${p.url}`,
    ``,
    `— HRD Mote Kreatif`,
  ].join("\n");
}

/** Deadline reminder digest for one assignee. */
export function deadlineReminderWa(p: {
  name: string;
  tasks: { title: string; clientName: string; dueDate: string | null }[];
  url: string;
}): string {
  const list = p.tasks
    .map((t) => `• ${t.title} (${t.clientName}) — deadline ${t.dueDate ?? "—"}`)
    .join("\n");
  return [
    `Halo ${p.name}, ini pengingat dari HRD Mote 🙏`,
    ``,
    `Task kamu mendekati / lewat deadline:`,
    list,
    ``,
    `Mohon segera ditindaklanjuti ya. Kalau ada kendala, kabari head kamu.`,
    `Buka: ${p.url}`,
    ``,
    `— HRD Mote Kreatif`,
  ].join("\n");
}
