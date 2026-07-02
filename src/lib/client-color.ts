// Stable, auto-generated accent color per client (brand) — no DB column needed.
// Same clientId → always the same color, so brands stay visually consistent
// across the task list. ponytail: hash-into-fixed-palette; swap to a real
// `client.color` column only if the team wants brand-accurate colors.

const PALETTE = [
  "#e8622c", // orange
  "#2c86e8", // blue
  "#1a9d6b", // green
  "#b5533d", // terracotta
  "#8b5cf6", // violet
  "#d69e2e", // amber
  "#0ea5a5", // teal
  "#d6336c", // pink
  "#5563de", // indigo
  "#6b8e23", // olive
];

export function clientColor(
  key: string | null | undefined,
  explicit?: string | null,
): string {
  if (explicit) return explicit; // user-picked brand color in Clients form
  if (!key) return "#9aa0a6"; // neutral gray for tasks without a client
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
