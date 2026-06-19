/**
 * Generate idempotent SQL to migrate local kol_activation → prod.
 * clientId differs per env, so we resolve the client by NAME at apply time.
 * Idempotent: INSERT ... WHERE NOT EXISTS (client + period + username), so a
 * re-run never duplicates. Source = local DB (already verified correct).
 */
import postgres from "postgres";
import fs from "node:fs";

const sql = postgres("postgresql://mote:mote@127.0.0.1:5433/mote-db");
const OUT = "scripts/kol-import-prod-v1.sql";

const rows = await sql`
  select c.name as client_name, k.*
  from moteteam.kol_activation k
  join moteteam.client c on c.id = k.client_id
  order by c.name, k.username`;

const txt = (v: unknown) =>
  v === null || v === undefined ? "NULL" : `$t$${String(v)}$t$`;
const num = (v: unknown) => (v === null || v === undefined ? "NULL" : String(v));
const dat = (v: unknown) => (v ? `DATE '${String(v).slice(0, 10)}'` : "NULL");

const out: string[] = [
  "-- KOL activation: local → prod migration v1.",
  "-- Resolves client by NAME (clientId differs per env). Idempotent:",
  "-- INSERT WHERE NOT EXISTS (client_id + period + username).",
  "-- Apply with: psql --single-transaction -f this.sql",
  "",
];

for (const r of rows as Record<string, unknown>[]) {
  const cid = `(SELECT id FROM moteteam.client WHERE name = ${txt(r.client_name)})`;
  out.push(
    `INSERT INTO moteteam.kol_activation ` +
      `(client_id, period, status, username, ig_link, ig_followers, ig_er, ` +
      `tiktok_link, tiktok_followers, tiktok_er, placement, link_post, date_post, ` +
      `fee, product_cost, reach, impressions, likes, comments, shares, saves, notes)\n` +
      `SELECT ${cid}, ${txt(r.period)}, ${txt(r.status)}, ${txt(r.username)}, ` +
      `${txt(r.ig_link)}, ${num(r.ig_followers)}, ${num(r.ig_er)}, ` +
      `${txt(r.tiktok_link)}, ${num(r.tiktok_followers)}, ${num(r.tiktok_er)}, ` +
      `${txt(r.placement)}, ${txt(r.link_post)}, ${dat(r.date_post)}, ` +
      `${num(r.fee)}, ${num(r.product_cost)}, ${num(r.reach)}, ${num(r.impressions)}, ` +
      `${num(r.likes)}, ${num(r.comments)}, ${num(r.shares)}, ${num(r.saves)}, ${txt(r.notes)}\n` +
      `WHERE NOT EXISTS (SELECT 1 FROM moteteam.kol_activation x ` +
      `WHERE x.client_id = ${cid} AND x.period = ${txt(r.period)} AND x.username = ${txt(r.username)});`,
  );
}

fs.writeFileSync(OUT, out.join("\n") + "\n");
console.log(`Wrote ${OUT}: ${rows.length} KOL rows`);
await sql.end();
