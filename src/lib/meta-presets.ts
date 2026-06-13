/** Client-safe Meta date-range presets (no server deps). */
export const META_PRESETS = [
  { value: "today", label: "Hari ini" },
  { value: "yesterday", label: "Kemarin" },
  { value: "last_7d", label: "7 hari terakhir" },
  { value: "last_14d", label: "14 hari terakhir" },
  { value: "last_28d", label: "28 hari terakhir" },
  { value: "last_30d", label: "30 hari terakhir" },
  { value: "this_month", label: "Bulan ini" },
  { value: "last_month", label: "Bulan lalu" },
  { value: "maximum", label: "Maksimum" },
] as const;
