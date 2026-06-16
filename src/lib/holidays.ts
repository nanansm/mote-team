import { HOLIDAY_SNAPSHOT } from "@/data/holidays-snapshot";
import { OBSERVANCES } from "@/data/observances";

/**
 * Hari libur nasional Indonesia + momen konten, untuk overlay di Kalender.
 *
 * Dua sumber digabung:
 *  1. Libur nasional + cuti bersama → fetch live dari guangrei APIHariLibur_V2
 *     (sumber Google Calendar, auto-update tanggal Islam yang geser tiap tahun).
 *     8s timeout + cache 24 jam, fallback ke snapshot bundled kalau gagal —
 *     kalender tak pernah blank (anti-stuck PRD §5.1).
 *  2. Momen konten fixed-date (Kartini, Ibu, dst) → OBSERVANCES statik.
 *
 * `kind`: "national" (tanggal merah) vs "observance" (momen konten, non-libur).
 */
export type HolidayKind = "national" | "observance";
export type Holiday = { date: string; name: string; kind: HolidayKind };

const SRC =
  "https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/calendar.json";

type RawEntry = { description?: string[]; holiday?: boolean; summary?: string[] };
type RawCalendar = Record<string, RawEntry>;

/** Buang penanda tentatif supaya label rapi. */
const clean = (s: string): string =>
  s.replace(/\s*\(belum pasti\)\s*/gi, "").trim();

async function fetchLive(year: number): Promise<Holiday[] | null> {
  try {
    const res = await fetch(SRC, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as RawCalendar;
    return Object.entries(raw)
      .filter(([d]) => d.startsWith(`${year}-`))
      .map(([date, e]) => ({
        date,
        name: clean(e.summary?.[0] ?? "Libur nasional"),
        kind: (e.holiday ? "national" : "observance") as HolidayKind,
      }));
  } catch {
    return null;
  }
}

/** Map YMD → Holiday untuk satu tahun. Libur menang atas momen bila tabrakan. */
export async function getHolidays(year: number): Promise<Record<string, Holiday>> {
  const live = await fetchLive(year);
  const national = live ?? HOLIDAY_SNAPSHOT[year] ?? [];

  const map: Record<string, Holiday> = {};
  for (const h of national) map[h.date] = h;

  for (const o of OBSERVANCES) {
    const date = `${year}-${o.md}`;
    // Jangan timpa tanggal merah yang sudah ada (mis. 1 Jun Pancasila).
    if (!map[date]) map[date] = { date, name: o.name, kind: "observance" };
  }

  return map;
}
