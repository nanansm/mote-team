import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Singleton DB pool (PRD 5.1). Reuse one postgres-js client across requests and
 * across HMR reloads in dev — never create a new pool per request.
 */
const globalForDb = globalThis as unknown as {
  __motePg?: ReturnType<typeof postgres>;
};

const connectionString = process.env.DATABASE_URL ?? "";

export const sqlClient =
  globalForDb.__motePg ??
  postgres(connectionString, {
    max: 10,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__motePg = sqlClient;
}

export const db = drizzle(sqlClient, { schema });

export { schema };
