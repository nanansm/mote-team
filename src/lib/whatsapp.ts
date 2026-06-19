/**
 * WhatsApp notifications via a self-hosted Evolution API gateway (v2).
 *
 * Config (base URL / instance / api key) lives in Settings (app_setting),
 * falling back to env. Sends are best-effort: a failure must never block the
 * task action or the cron job that triggered it.
 */
import { getWaConfig, getWaTemplates, isWaEnabled } from "./config";
import { WA_TEMPLATE_DEFAULTS, fillTemplate } from "./wa-templates";

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
export async function taskAssignedWa(p: {
  name: string;
  taskTitle: string;
  clientName: string;
  dueDate: string | null;
  url: string;
}): Promise<string> {
  const tpl = (await getWaTemplates()).assign || WA_TEMPLATE_DEFAULTS.assign;
  return fillTemplate(tpl, {
    nama: p.name,
    judul: p.taskTitle,
    klien: p.clientName,
    deadline: p.dueDate ?? "—",
    link: p.url,
  });
}

/** Deadline reminder digest for one assignee. */
export async function deadlineReminderWa(p: {
  name: string;
  tasks: { title: string; clientName: string; dueDate: string | null }[];
  url: string;
}): Promise<string> {
  const tpl =
    (await getWaTemplates()).reminder || WA_TEMPLATE_DEFAULTS.reminder;
  const list = p.tasks
    .map((t) => `• ${t.title} (${t.clientName}) — deadline ${t.dueDate ?? "—"}`)
    .join("\n");
  return fillTemplate(tpl, { nama: p.name, list, link: p.url });
}

/** Stale-KOL outreach digest (KOLs stuck in outreach statuses). */
export function kolStaleWa(p: {
  name: string;
  kols: { username: string; clientName: string; status: string; days: number }[];
  url: string;
}): string {
  const list = p.kols
    .map(
      (k) =>
        `• ${k.username} (${k.clientName}) — ${k.status}, ${k.days} hari diam`,
    )
    .join("\n");
  return `Halo ${p.name}, ${p.kols.length} KOL nyangkut di outreach (belum gerak >3 hari):\n${list}\n\nFollow up: ${p.url}`;
}
