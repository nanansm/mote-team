/**
 * Production migration runner — executed at container start (see package.json
 * "start"). Uses drizzle-orm's migrator (a runtime dependency), NOT drizzle-kit,
 * so it works in the deployed image without devDependencies. Idempotent: the
 * drizzle journal skips already-applied migrations. Runs inside the app
 * container, on the same network as the DB (no host/tunnel routing needed).
 */
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
} catch (err) {
  console.error("[migrate-prod] migration failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
