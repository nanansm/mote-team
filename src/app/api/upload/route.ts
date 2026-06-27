import { uploadImage, type UploadKind } from "@/lib/r2";
import { requireSession } from "@/lib/session";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  await requireSession();

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "File tidak ditemukan" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Maksimal 10MB" }, { status: 400 });
  }

  const kindRaw = form.get("kind");
  const kind: UploadKind =
    kindRaw === "logo" ? "logo" : kindRaw === "avatar" ? "avatar" : "task";
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadImage(buffer, file.name, file.type, kind);
  return Response.json({ url });
}
