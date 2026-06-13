import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { env } from "./env";

/**
 * At-rest encryption for sensitive `app_setting` values (integration tokens).
 *
 * Stored values look like `enc:v1:<base64(iv|ciphertext|tag)>`. Anything that
 * does NOT carry the marker is treated as legacy plaintext and returned as-is,
 * so existing rows keep working and get upgraded the next time they're saved.
 *
 * Key derives from BETTER_AUTH_SECRET (already required for auth). If that secret
 * is missing we degrade to plaintext rather than crash — the secret is validated
 * elsewhere at boot.
 */

const MARKER = "enc:v1:";
const IV_LEN = 12; // GCM standard
const TAG_LEN = 16;

let cachedKey: Buffer | null = null;
function key(): Buffer | null {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret) return null;
  cachedKey ??= scryptSync(secret, "mote-app-setting", 32);
  return cachedKey;
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(MARKER);
}

export function encryptSecret(plain: string): string {
  const k = key();
  if (!k || plain === "") return plain; // nothing to protect / no key
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return MARKER + Buffer.concat([iv, enc, tag]).toString("base64");
}

export function decryptSecret(value: string): string {
  if (!isEncrypted(value)) return value; // legacy plaintext
  const k = key();
  if (!k) return value;
  try {
    const raw = Buffer.from(value.slice(MARKER.length), "base64");
    const iv = raw.subarray(0, IV_LEN);
    const tag = raw.subarray(raw.length - TAG_LEN);
    const enc = raw.subarray(IV_LEN, raw.length - TAG_LEN);
    const decipher = createDecipheriv("aes-256-gcm", k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString(
      "utf8",
    );
  } catch {
    return ""; // tampered / wrong key → treat as unset, never throw
  }
}
