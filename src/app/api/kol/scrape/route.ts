import { requireSession } from "@/lib/session";
import { scrapeInstagram, scrapeTiktok } from "@/lib/scrape-kol";

export const runtime = "nodejs";

/**
 * POST /api/kol/scrape — auth-gated. Body: { ig?: string, tiktok?: string }
 * (profile link or @handle). Returns scraped profile fields. Each platform is
 * independent: one failing returns null for that platform, not an error.
 */
export async function POST(req: Request) {
  await requireSession();

  let body: { ig?: string; tiktok?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body invalid" }, { status: 400 });
  }

  const ig = body.ig?.trim();
  const tiktok = body.tiktok?.trim();
  if (!ig && !tiktok) {
    return Response.json(
      { error: "Isi link/handle IG atau TikTok dulu" },
      { status: 400 },
    );
  }

  const [igResult, ttResult] = await Promise.all([
    ig ? scrapeInstagram(ig) : Promise.resolve(null),
    tiktok ? scrapeTiktok(tiktok) : Promise.resolve(null),
  ]);

  return Response.json({ ig: igResult, tiktok: ttResult });
}
