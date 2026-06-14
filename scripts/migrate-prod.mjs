/**
 * Production migration runner — executed at container start (see package.json
 * "start"). Uses drizzle-orm's migrator (a runtime dependency), NOT drizzle-kit,
 * so it works in the deployed image without devDependencies. Idempotent: the
 * drizzle journal skips already-applied migrations. Runs inside the app
 * container, on the same network as the DB (no host/tunnel routing needed).
 */
import fs from "node:fs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[migrate-prod] DATABASE_URL not set — skipping migrations.");
  process.exit(0);
}

const sql = postgres(url, { max: 1 });
try {
  console.log("[migrate-prod] applying migrations…");
  await migrate(drizzle(sql), { migrationsFolder: "drizzle" });
  console.log("[migrate-prod] migrations up to date.");

  // One-time data seed (clients/team/tasks/assignees from Notion). Runs only
  // when the client table is empty, so it never clobbers live edits. The seed
  // itself is ON CONFLICT DO NOTHING for extra safety.
  const [{ n }] = await sql`select count(*)::int n from moteteam.client`;
  if (n === 0 && fs.existsSync("scripts/seed-prod.sql")) {
    console.log("[migrate-prod] empty DB → seeding initial data…");
    await sql.unsafe(fs.readFileSync("scripts/seed-prod.sql", "utf8"));
    const [c] = await sql`select count(*)::int n from moteteam.client`;
    const [t] = await sql`select count(*)::int n from moteteam.task`;
    console.log(`[migrate-prod] seeded: clients=${c.n} tasks=${t.n}.`);
  } else {
    console.log(`[migrate-prod] data present (clients=${n}) → skip seed.`);
  }
} catch (err) {
  console.error("[migrate-prod] migration/seed failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
