import { defineConfig } from "drizzle-kit";

// Schema lives in the `moteteam` namespace inside the existing `mote-db` database.
// `generate` works offline from the schema; `migrate`/`push` need DATABASE_URL.
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["moteteam"],
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
