/**
 * WhatsApp message templates — pure constants + helper, no server deps so this
 * is safe to import from client components (the Settings editor) as well as the
 * server-side sender in lib/whatsapp.
 */

/**
 * Default message templates (HRD voice). Editable in Settings; these are the
 * fallback when the admin hasn't customized them. Placeholders in {curly} are
 * substituted at send time — see fillTemplate / WA_TEMPLATE_PLACEHOLDERS.
 */
export const WA_TEMPLATE_DEFAULTS = {
  // Available: {nama} {judul} {klien} {deadline} {link}
  assign: [
    `Halo {nama} 👋`,
    ``,
    `Ada task baru buat kamu dari tim Mote:`,
    `📌 {judul}`,
    `🏢 Klien: {klien}`,
    `🗓️ Deadline: {deadline}`,
    ``,
    `Tolong dicek & dikerjakan ya 🙏`,
    `Buka: {link}`,
    ``,
    `— HRD Mote Kreatif`,
  ].join("\n"),
  // Available: {nama} {list} {link}
  reminder: [
    `Halo {nama}, ini pengingat dari HRD Mote 🙏`,
    ``,
    `Task kamu mendekati / lewat deadline:`,
    `{list}`,
    ``,
    `Mohon segera ditindaklanjuti ya. Kalau ada kendala, kabari head kamu.`,
    `Buka: {link}`,
    ``,
    `— HRD Mote Kreatif`,
  ].join("\n"),
} as const;

/** Placeholders advertised in the Settings UI for each template. */
export const WA_TEMPLATE_PLACEHOLDERS = {
  assign: ["{nama}", "{judul}", "{klien}", "{deadline}", "{link}"],
  reminder: ["{nama}", "{list}", "{link}"],
} as const;

/** Replace {key} tokens with values; unknown tokens are left untouched. */
export function fillTemplate(
  tpl: string,
  vars: Record<string, string>,
): string {
  return tpl.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m));
}
