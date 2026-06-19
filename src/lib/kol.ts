/**
 * KOL activation derived metrics. The DB stores only raw, team-entered numbers;
 * everything below is computed here to match the team's tracking sheet exactly:
 *   interaction = likes + comments + shares + saves
 *   total cost  = fee + product cost          (the sheet's "Product & Cost")
 *   ER %        = interaction / impressions
 *   CPE         = total cost / interaction
 *   CPV         = total cost / impressions
 */
import type { KolRow, KolStatus } from "./types";

// Pipeline order + human labels (shared by form, table, badges).
export const KOL_STATUS_ORDER: KolStatus[] = [
  "belum_bales_dm",
  "sudah_bales_dm",
  "minta_rate_card",
  "nego",
  "deal",
  "mau_datang_review",
  "sudah_posting",
  "sudah_review",
  "cancel",
];

export const KOL_STATUS_LABEL: Record<KolStatus, string> = {
  belum_bales_dm: "Belum Bales DM",
  sudah_bales_dm: "Sudah Bales DM",
  minta_rate_card: "Minta Rate Card",
  nego: "Nego",
  deal: "Deal",
  mau_datang_review: "Mau Datang & Review",
  sudah_posting: "Sudah Posting",
  sudah_review: "Sudah Review",
  cancel: "Cancel",
};

export type KolComputed = {
  /** fee + product cost (Rp). */
  totalCost: number;
  /** likes + comments + shares + saves. */
  interaction: number;
  /** ER % = interaction / impressions. */
  er: number;
  /** CPE (Rp) = total cost / interaction. */
  cpe: number;
  /** CPV (Rp) = total cost / impressions. */
  cpv: number;
};

const pct = (n: number, d: number): number =>
  d > 0 ? Math.round((n / d) * 10000) / 100 : 0;

export function computeKol(r: KolRow): KolComputed {
  const totalCost = (Number(r.fee) || 0) + (Number(r.productCost) || 0);
  const interaction = r.likes + r.comments + r.shares + r.saves;
  return {
    totalCost,
    interaction,
    er: pct(interaction, r.impressions),
    cpe: interaction > 0 ? Math.round(totalCost / interaction) : 0,
    cpv: r.impressions > 0 ? Math.round(totalCost / r.impressions) : 0,
  };
}

/** A row joined with its computed metrics — convenient for tables/sorting. */
export type KolRowComputed = KolRow & KolComputed;

export function withComputed(rows: KolRow[]): KolRowComputed[] {
  return rows.map((r) => ({ ...r, ...computeKol(r) }));
}

export type KolAggregate = {
  /** distinct KOL usernames in the set. */
  kolCount: number;
  /** number of rows (collaborations). */
  postCount: number;
  totalCost: number;
  impressions: number;
  reach: number;
  interaction: number;
  /** ER % across the set = interaction / impressions. */
  er: number;
  cpe: number;
  cpv: number;
};

export function aggregateKol(rows: KolRow[]): KolAggregate {
  const computed = rows.map(computeKol);
  const totalCost = computed.reduce((s, c) => s + c.totalCost, 0);
  const interaction = computed.reduce((s, c) => s + c.interaction, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const reach = rows.reduce((s, r) => s + r.reach, 0);

  return {
    kolCount: new Set(rows.map((r) => r.username.trim().toLowerCase())).size,
    postCount: rows.length,
    totalCost,
    impressions,
    reach,
    interaction,
    er: pct(interaction, impressions),
    cpe: interaction > 0 ? Math.round(totalCost / interaction) : 0,
    cpv: impressions > 0 ? Math.round(totalCost / impressions) : 0,
  };
}

/** Top N posts by interaction (default 3). Only posted rows have metrics. */
export function topKolPosts(rows: KolRow[], n = 3): KolRowComputed[] {
  return withComputed(rows)
    .filter((r) => r.interaction > 0)
    .sort((a, b) => b.interaction - a.interaction)
    .slice(0, n);
}
