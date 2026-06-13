import { pgSchema } from "drizzle-orm/pg-core";

/**
 * All Mote Team tables live in a dedicated `moteteam` schema inside the shared
 * `mote-db` database, matching the schema-per-product convention (klir, capture, ...).
 */
export const moteteam = pgSchema("moteteam");
