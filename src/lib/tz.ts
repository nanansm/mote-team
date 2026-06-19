/**
 * Timezone helpers — the team operates in WIB (Asia/Jakarta, UTC+7, no DST).
 *
 * The server runs in UTC. So `new Date().toISOString().slice(0,10)` and
 * `new Date().getMonth()` drift up to 7 hours: between 00:00–07:00 WIB they
 * report the *previous* day/month. That silently shifts "due tomorrow"
 * reminders, calendar "today", and "bulan ini" report windows by a day.
 *
 * Always derive calendar dates (YMD strings) through these helpers — never
 * format a Date for date-logic directly. (Storing timestamps via `new Date()`
 * for `updatedAt`/`createdAt` is fine; those are instants, not calendar days.)
 */

export const TZ = "Asia/Jakarta";

// en-CA locale formats as YYYY-MM-DD, which is exactly the YMD we compare on.
const ymdFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** YMD ("2026-06-13") for an instant, in Jakarta. Defaults to now. */
export function ymdJakarta(d: Date = new Date()): string {
  return ymdFmt.format(d);
}

/** Today in Jakarta as a YMD string. */
export function todayJakarta(): string {
  return ymdJakarta();
}

/** Year / month (1-12) / day for an instant, in Jakarta. */
export function jakartaParts(d: Date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = ymdFmt.format(d).split("-").map(Number);
  return { year, month, day };
}

/** Midnight (WIB) of a YMD string as a UTC instant. WIB has no DST → always +07. */
export function jakartaMidnight(ymd: string): Date {
  return new Date(`${ymd}T00:00:00+07:00`);
}

/**
 * YMD `days` away from `from` (default today), counted in Jakarta calendar
 * days. Anchors on WIB midnight so it never half-steps across the UTC boundary.
 */
export function ymdOffset(days: number, from: Date = new Date()): string {
  const base = jakartaMidnight(ymdJakarta(from));
  return ymdJakarta(new Date(base.getTime() + days * 86_400_000));
}

/** First day of a month as YMD (month is 1-12). */
export function firstOfMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

// Human-readable date in WIB, Indonesian short month (e.g. "1 Jun 2026").
const longFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Format a YMD string as a readable WIB date ("1 Jun 2026"). */
export function formatDateJakarta(ymd: string): string {
  return longFmt.format(jakartaMidnight(ymd));
}

/** Format a YMD window as "1 Jun 2026 – 19 Jun 2026" (WIB). */
export function formatRangeJakarta(from: string, to: string): string {
  return `${formatDateJakarta(from)} – ${formatDateJakarta(to)}`;
}
