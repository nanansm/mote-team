import { getR2Object } from "@/lib/r2";
import { requireSession } from "@/lib/session";

export const runtime = "nodejs";

/** Auth-gated proxy that streams private R2 objects to logged-in users. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  await requireSession();

  const { key } = await params;
  const objectKey = key.join("/");

  const obj = await getR2Object(objectKey);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
