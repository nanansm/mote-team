import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { env } from "./env";

/**
 * Object storage with a local fallback. When R2 env vars are set, uploads go to
 * Cloudflare R2 (private bucket) and are served back through the auth-gated
 * proxy route /api/r2/<key> — no public bucket / R2_PUBLIC_URL needed.
 * Otherwise files are written to public/uploads (mock mode) so local dev works
 * without any cloud credentials.
 */
export function isR2Configured(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET_NAME,
  );
}

let cachedClient: S3Client | null = null;
function getClient(): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint:
        env.R2_ENDPOINT ||
        `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return cachedClient;
}

export type UploadKind = "task" | "logo";

async function processImage(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  kind: UploadKind,
): Promise<{ body: Buffer; ext: string; ctype: string }> {
  const fallbackExt = (originalName.split(".").pop() || "bin").toLowerCase();
  if (!contentType.startsWith("image/")) {
    return { body: buffer, ext: fallbackExt, ctype: contentType || "application/octet-stream" };
  }
  try {
    if (kind === "logo") {
      // Logo: fit within 400×400, keep transparency, output PNG.
      const body = await sharp(buffer)
        .rotate()
        .resize(400, 400, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toBuffer();
      return { body, ext: "png", ctype: "image/png" };
    }
    // Task media: cap at 1600px, JPEG.
    const body = await sharp(buffer)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toBuffer();
    return { body, ext: "jpg", ctype: "image/jpeg" };
  } catch {
    return { body: buffer, ext: fallbackExt, ctype: contentType };
  }
}

/** Upload an image to R2 (or mock storage), returning a servable URL. */
export async function uploadImage(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  kind: UploadKind = "task",
): Promise<string> {
  const folder = kind === "logo" ? "logos" : "tasks";
  const { body, ext, ctype } = await processImage(
    buffer,
    originalName,
    contentType,
    kind,
  );
  const key = `${folder}/${randomUUID()}.${ext}`;

  if (isR2Configured()) {
    await getClient().send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: ctype,
      }),
    );
    return `/api/r2/${key}`; // auth-gated proxy (private bucket)
  }

  // Mock mode: write under public/uploads/<folder>.
  const fname = key.split("/").pop()!;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fname), body);
  return `/uploads/${folder}/${fname}`;
}

/** Stream an object back from R2 for the proxy route. */
export async function getR2Object(
  key: string,
): Promise<{ body: ReadableStream; contentType: string } | null> {
  if (!isR2Configured()) return null;
  const res = await getClient().send(
    new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
  );
  if (!res.Body) return null;
  return {
    body: (res.Body as { transformToWebStream: () => ReadableStream }).transformToWebStream(),
    contentType: res.ContentType ?? "application/octet-stream",
  };
}
