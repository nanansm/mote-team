import { asc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { client } from "@/db/schema";
import { resolveCustom, resolveRange } from "@/lib/date-range";
import { getMetaPerf, isMetaConfigured, type MetaPerf } from "@/lib/meta";
import { getAllOrganic, isWindsorConfigured } from "@/lib/windsor";
import { PerformancePanel } from "./performance-panel";
import type { ClientData } from "./types";

export const dynamic = "force-dynamic";

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const isCustom = Boolean(sp.from && sp.to);
  const presetValue = isCustom ? "custom" : sp.range || "this_month";
  const resolved = isCustom
    ? resolveCustom(sp.from!, sp.to!)
    : resolveRange(sp.range || "this_month");

  const clients = await db
    .select({
      id: client.id,
      name: client.name,
      ig: client.windsorAccountId,
      tiktok: client.windsorTiktokId,
      meta: client.metaAdAccountId,
    })
    .from(client)
    .where(eq(client.status, "active"))
    .orderBy(asc(client.name));

  const [windsorConfigured, metaConfigured] = await Promise.all([
    isWindsorConfigured(),
    isMetaConfigured(),
  ]);

  let organic: Awaited<ReturnType<typeof getAllOrganic>> | null = null;
  if (windsorConfigured) {
    try {
      organic = await getAllOrganic(resolved);
    } catch (e) {
      console.error("[performance] windsor failed:", e);
    }
  }

  // Meta insights per mapped client (same window), in parallel.
  const metaClients = clients.filter((c) => c.meta);
  const metaResults = metaConfigured
    ? await Promise.allSettled(
        metaClients.map((c) =>
          getMetaPerf(c.meta!, {
            from: resolved.current.from,
            to: resolved.current.to,
          }),
        ),
      )
    : [];
  const metaById = new Map<string, MetaPerf | null>();
  metaClients.forEach((c, i) => {
    const r = metaResults[i];
    metaById.set(c.id, r && r.status === "fulfilled" ? r.value : null);
  });

  const data: ClientData[] = clients
    .map((c) => ({
      id: c.id,
      name: c.name,
      ig: c.ig ? (organic?.ig.get(c.ig) ?? null) : null,
      tiktok: c.tiktok ? (organic?.tiktok.get(c.tiktok) ?? null) : null,
      meta: metaById.get(c.id) ?? null,
    }))
    .filter((c) => c.ig || c.tiktok || c.meta);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance"
        description="Organic (IG · TikTok) & Meta Ads per klien · vs periode sebelumnya"
      />
      <PerformancePanel
        clients={data}
        windsorConfigured={windsorConfigured}
        metaConfigured={metaConfigured}
        rangeValue={presetValue}
        rangeFrom={sp.from}
        rangeTo={sp.to}
      />
    </div>
  );
}
