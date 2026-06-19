/** Shared month-picker helpers. Anchors are "YYYY-MM" strings. */

export const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-06" → "Juni 2026". */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${ID_MONTHS[m - 1]} ${y}`;
}

/** Months from `back` before to `fwd` after the anchor, oldest → newest. */
export function monthOptions(anchor: string, back = 6, fwd = 6): string[] {
  const [y, m] = anchor.split("-").map(Number);
  const out: string[] = [];
  for (let i = -back; i <= fwd; i++) {
    const d = new Date(Date.UTC(y, m - 1 + i, 1));
    out.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    );
  }
  return out;
}

/** Full calendar-month window for a "YYYY-MM" anchor. */
export function monthWindow(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${ym}-01`, to: `${ym}-${String(last).padStart(2, "0")}` };
}
