/** Shared display formatters (Indonesian locale, Rupiah). */

/** Whole-number with thousands separators ("1.234"). */
export const fmtNum = (n: number): string => Math.round(n).toLocaleString("id-ID");

/** Rupiah; compact to "jt" for ≥ 1 million. */
export const rp = (n: number): string =>
  n >= 1_000_000
    ? `Rp${(n / 1_000_000).toFixed(1)}jt`
    : `Rp${Math.round(n).toLocaleString("id-ID")}`;

/** Compact follower-style count ("25.0k"); null → "—". */
export const kfmt = (n: number | null | undefined): string =>
  n == null ? "—" : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

/** Month-over-month % change; null when there's no baseline. */
export function deltaPct(cur: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}
