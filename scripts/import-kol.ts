/**
 * One-off importer: load KOL activation rows from a JSON file into kol_activation.
 *
 *   IMPORT_KOL_FILE=scripts/kol-rancabango-juni.json npm run import:kol
 *
 * Idempotent per (clientId, period): deletes existing rows for every
 * (clientId, period) pair present in the file, then inserts the file rows.
 * Run against LOCAL DB first.
 */
import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db";
import { kolActivation } from "../src/db/schema";

type Row = typeof kolActivation.$inferInsert;

async function main() {
  const file = process.env.IMPORT_KOL_FILE;
  if (!file) {
    console.error("Set IMPORT_KOL_FILE=path/to/rows.json");
    process.exit(1);
  }
  const rows = JSON.parse(readFileSync(file, "utf8")) as Row[];
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error("No rows in file.");
    process.exit(1);
  }

  // Unique (clientId, period) pairs to clear first.
  const pairs = new Map<string, { clientId: string; period: string }>();
  for (const r of rows) pairs.set(`${r.clientId}|${r.period}`, { clientId: r.clientId, period: r.period });

  for (const { clientId, period } of pairs.values()) {
    const del = await db
      .delete(kolActivation)
      .where(and(eq(kolActivation.clientId, clientId), eq(kolActivation.period, period)))
      .returning({ id: kolActivation.id });
    console.log(`Cleared ${del.length} existing rows for ${clientId} ${period}`);
  }

  const inserted = await db.insert(kolActivation).values(rows).returning({ id: kolActivation.id });
  console.log(`Inserted ${inserted.length} rows from ${file}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
