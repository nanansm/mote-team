import { cache } from "react";
import { db } from "@/db";
import { appSetting } from "@/db/schema";
import { decryptSecret } from "./crypto";
import { env } from "./env";

/** Keys whose values are stored encrypted at rest (see lib/crypto). */
export const SECRET_SETTING_KEYS = new Set([
  "windsor_api_key",
  "meta_access_token",
]);

/**
 * Editable runtime config. DB (app_setting) overrides env defaults. Cached
 * per-request via React cache() so many lookups = one query. Secret-valued
 * keys are transparently decrypted here.
 */
export const getSettings = cache(
  async (): Promise<Record<string, string>> => {
    try {
      const rows = await db.select().from(appSetting);
      return Object.fromEntries(
        rows.map((r) => [
          r.key,
          SECRET_SETTING_KEYS.has(r.key) ? decryptSecret(r.value) : r.value,
        ]),
      );
    } catch {
      return {};
    }
  },
);

async function value(key: string, fallback: string): Promise<string> {
  const s = await getSettings();
  return s[key] ?? fallback;
}

async function flag(key: string, def: boolean): Promise<boolean> {
  const s = await getSettings();
  return s[key] === undefined ? def : s[key] === "true";
}

/* ----- integration accessors (used by the libs + settings page) ----- */

export const getWindsorKey = () => value("windsor_api_key", env.WINDSOR_API_KEY);
export const isWindsorEnabled = () => flag("windsor_enabled", true);

export const getMetaToken = () => value("meta_access_token", env.META_ACCESS_TOKEN);
export const isMetaEnabled = () => flag("meta_enabled", true);

/** Settings keys that the admin UI manages. */
export const SETTING_KEYS = {
  windsorKey: "windsor_api_key",
  windsorEnabled: "windsor_enabled",
  metaToken: "meta_access_token",
  metaEnabled: "meta_enabled",
} as const;
