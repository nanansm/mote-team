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

  // One-time June full-content backfill (status/due/caption/links/content from
  // Notion). Guarded by an app_setting flag so it runs exactly once and never
  // overwrites later in-app edits. Statements are UPDATE ... WHERE id=…, so a
  // re-run (if the flag were cleared) only re-sets those same June rows.
  const flag = await sql`select 1 from moteteam.app_setting where key = 'june_content_v1'`;
  if (flag.length === 0 && fs.existsSync("scripts/june-content.sql")) {
    console.log("[migrate-prod] applying June content backfill…");
    await sql.unsafe(fs.readFileSync("scripts/june-content.sql", "utf8"));
    await sql`insert into moteteam.app_setting (key, value) values ('june_content_v1', 'done') on conflict (key) do nothing`;
    const [c] = await sql`select count(*)::int n from moteteam.task where content is not null`;
    console.log(`[migrate-prod] June content applied (tasks with content=${c.n}).`);
  } else {
    console.log("[migrate-prod] June content already applied → skip.");
  }

  // One-time cleanup of duplicate team_member rows from the old accept-invite
  // flow (link real member to its auth user, drop the orphan dupes).
  const dflag = await sql`select 1 from moteteam.app_setting where key = 'dedupe_members_v1'`;
  if (dflag.length === 0 && fs.existsSync("scripts/dedupe-members.sql")) {
    console.log("[migrate-prod] de-duplicating team members…");
    await sql.unsafe(fs.readFileSync("scripts/dedupe-members.sql", "utf8"));
    await sql`insert into moteteam.app_setting (key, value) values ('dedupe_members_v1', 'done') on conflict (key) do nothing`;
    const [c] = await sql`select count(*)::int n from moteteam.team_member`;
    console.log(`[migrate-prod] members de-duped (total team_member=${c.n}).`);
  } else {
    console.log("[migrate-prod] member dedupe already applied → skip.");
  }
} catch (err) {
  console.error("[migrate-prod] migration/seed failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
