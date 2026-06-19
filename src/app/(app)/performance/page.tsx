import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { client, kolActivation } from "@/db/schema";
import { resolveCustom, resolveRange } from "@/lib/date-range";
import { formatRangeJakarta } from "@/lib/tz";
import { aggregateKol, topKolPosts } from "@/lib/kol";
import { getMetaPerf, isMetaConfigured, type MetaPerf } from "@/lib/meta";
import { getAllOrganic, isWindsorConfigured } from "@/lib/windsor";
import { PerformancePanel } from "./performance-panel";
import type { ClientData, KolData } from "./types";

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
      gmb: client.windsorGmbId,
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

  // KOL: team-entered, keyed by month (YYYY-MM). Pull every row whose month
  // falls inside the selected window, then aggregate per client.
  const fromMonth = resolved.current.from.slice(0, 7);
  const toMonth = resolved.current.to.slice(0, 7);
  const clientIds = clients.map((c) => c.id);
  const kolRows = clientIds.length
    ? await db
        .select()
        .from(kolActivation)
        .where(
          and(
            inArray(kolActivation.clientId, clientIds),
            gte(kolActivation.period, fromMonth),
            lte(kolActivation.period, toMonth),
          ),
        )
    : [];
  const kolByClient = new Map<string, KolData>();
  for (const id of clientIds) {
    const rows = kolRows.filter((r) => r.clientId === id);
    if (rows.length === 0) continue;
    kolByClient.set(id, {
      aggregate: aggregateKol(rows),
      top: topKolPosts(rows).map((p) => ({
        id: p.id,
        username: p.username,
        link: p.linkPost,
        interaction: p.interaction,
        er: p.er,
      })),
    });
  }

  const data: ClientData[] = clients
    .map((c) => ({
      id: c.id,
      name: c.name,
      ig: c.ig ? (organic?.ig.get(c.ig) ?? null) : null,
      tiktok: c.tiktok ? (organic?.tiktok.get(c.tiktok) ?? null) : null,
      gmb: c.gmb ? (organic?.gmb.get(c.gmb) ?? null) : null,
      meta: metaById.get(c.id) ?? null,
      kol: kolByClient.get(c.id) ?? null,
    }))
    .filter((c) => c.ig || c.tiktok || c.gmb || c.meta || c.kol);

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
        currentLabel={formatRangeJakarta(resolved.current.from, resolved.current.to)}
        previousLabel={formatRangeJakarta(resolved.previous.from, resolved.previous.to)}
      />
    </div>
  );
}
