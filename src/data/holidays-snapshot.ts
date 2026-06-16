import type { Holiday } from "@/lib/holidays";

/**
 * Snapshot libur nasional + perayaan dari sumber dinamis (guangrei
 * APIHariLibur_V2, sumber Google Calendar). Dipakai sebagai FALLBACK kalau
 * fetch live gagal/timeout — supaya kalender tetap nampil (anti-stuck PRD §5.1).
 *
 * Update manual sesekali (mis. saat ganti tahun) dengan menyalin output:
 *   https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/calendar.json
 * `kind`: "national" = holiday:true (tanggal merah), "observance" = holiday:false.
 */
export const HOLIDAY_SNAPSHOT: Record<number, Holiday[]> = {
  2026: [
    { date: "2026-01-01", name: "Hari Tahun Baru", kind: "national" },
    { date: "2026-01-16", name: "Isra Mikraj Nabi Muhammad", kind: "national" },
    { date: "2026-02-16", name: "Cuti Bersama Tahun Baru Imlek", kind: "national" },
    { date: "2026-02-17", name: "Tahun Baru Imlek", kind: "national" },
    { date: "2026-02-19", name: "1 Ramadan", kind: "observance" },
    { date: "2026-03-18", name: "Cuti Bersama Hari Suci Nyepi", kind: "national" },
    { date: "2026-03-19", name: "Hari Suci Nyepi (Tahun Baru Saka)", kind: "national" },
    { date: "2026-03-20", name: "Cuti Bersama Idul Fitri", kind: "national" },
    { date: "2026-03-21", name: "Hari Idul Fitri", kind: "national" },
    { date: "2026-03-22", name: "Hari Idul Fitri", kind: "national" },
    { date: "2026-03-23", name: "Cuti Bersama Idul Fitri", kind: "national" },
    { date: "2026-03-24", name: "Cuti Bersama Idul Fitri", kind: "national" },
    { date: "2026-04-03", name: "Wafat Isa Almasih", kind: "national" },
    { date: "2026-04-05", name: "Hari Paskah", kind: "national" },
    { date: "2026-05-01", name: "Hari Buruh Internasional / Pekerja", kind: "national" },
    { date: "2026-05-14", name: "Kenaikan Isa Al Masih", kind: "national" },
    { date: "2026-05-15", name: "Cuti Bersama Kenaikan Isa Al Masih", kind: "national" },
    { date: "2026-05-27", name: "Idul Adha (Lebaran Haji)", kind: "national" },
    { date: "2026-05-28", name: "Idul Adha (Lebaran Haji)", kind: "national" },
    { date: "2026-05-31", name: "Hari Raya Waisak", kind: "national" },
    { date: "2026-06-01", name: "Hari Lahir Pancasila", kind: "national" },
    { date: "2026-06-16", name: "Satu Muharam / Tahun Baru Hijriah", kind: "national" },
    { date: "2026-08-17", name: "Hari Proklamasi Kemerdekaan R.I.", kind: "national" },
    { date: "2026-08-25", name: "Maulid Nabi Muhammad", kind: "national" },
    { date: "2026-12-24", name: "Cuti Bersama Natal (Malam Natal)", kind: "national" },
    { date: "2026-12-25", name: "Hari Raya Natal", kind: "national" },
    { date: "2026-12-31", name: "Malam Tahun Baru", kind: "observance" },
  ],
};
