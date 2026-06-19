import { and, asc, eq, inArray } from "drizzle-orm";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { client, kolActivation, offlineMetric } from "@/db/schema";
import { resolveCustom } from "@/lib/date-range";
import { deltaPct, fmtNum, rp } from "@/lib/format";
import { aggregateKol } from "@/lib/kol";
import { getMetaPerf, isMetaConfigured } from "@/lib/meta";
import { requireAdmin } from "@/lib/session";
import { cn } from "@/lib/utils";
import { firstOfMonth, formatRangeJakarta, jakartaParts, todayJakarta } from "@/lib/tz";
import { getAllOrganic, isWindsorConfigured } from "@/lib/windsor";
import { PulseFilters } from "./pulse-filters";

export const dynamic = "force-dynamic";

const pctFmt = (n: number) => `${Math.round(n * 100) / 100}%`;

type Fmt = "rp" | "num" | "pct";
type Metric = { label: string; cur: number; prev: number; fmt: Fmt };

function valueStr(m: Metric): string {
  return m.fmt === "rp" ? rp(m.cur) : m.fmt === "pct" ? pctFmt(m.cur) : fmtNum(m.cur);
}
const delta = (m: Metric): number | null => deltaPct(m.cur, m.prev);

export default async function PulsePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; from?: string; to?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const { year, month } = jakartaParts();
  const nowMonth = `${year}-${String(month).padStart(2, "0")}`;
  const isCustom = Boolean(sp.from && sp.to);
  const from = sp.from ?? firstOfMonth(year, month);
  const to = sp.to ?? todayJakarta();
  const resolved = resolveCustom(from, to);
  const curMonth = from.slice(0, 7);
  // Calendar month before curMonth — KOL/Revenue are monthly, so MoM must be
  // the prior full month (resolved.previous.to can land in the same month for
  // mid-month custom ranges, which would zero the deltas).
  const [cy, cm] = curMonth.split("-").map(Number);
  const pd = new Date(Date.UTC(cy, cm - 2, 1));
  const prevMonth = `${pd.getUTCFullYear()}-${String(pd.getUTCMonth() + 1).padStart(2, "0")}`;

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

  const c =
    clients.find((x) => x.id === sp.client) ?? clients[0] ?? null;

  if (!c) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard Marketing Performance" />
        <p className="text-sm text-muted-foreground">Belum ada klien aktif.</p>
      </div>
    );
  }

  const [windsorOn, metaOn] = await Promise.all([
    isWindsorConfigured(),
    isMetaConfigured(),
  ]);

  let organic: Awaited<ReturnType<typeof getAllOrganic>> | null = null;
  if (windsorOn) {
    try {
      organic = await getAllOrganic(resolved);
    } catch (e) {
      console.error("[pulse] windsor:", e);
    }
  }
  const ig = c.ig ? organic?.ig.get(c.ig) : undefined;
  const tiktok = c.tiktok ? organic?.tiktok.get(c.tiktok) : undefined;
  const gmb = c.gmb ? organic?.gmb.get(c.gmb) : undefined;

  const [metaCurR, metaPrevR] = c.meta && metaOn
    ? await Promise.allSettled([
        getMetaPerf(c.meta, { from: resolved.current.from, to: resolved.current.to }),
        getMetaPerf(c.meta, { from: resolved.previous.from, to: resolved.previous.to }),
      ])
    : [];
  const metaCur = metaCurR?.status === "fulfilled" ? metaCurR.value : null;
  const metaPrev = metaPrevR?.status === "fulfilled" ? metaPrevR.value : null;

  // Only the two months in play (not the client's whole history).
  const [kolRows, revRows] = await Promise.all([
    db
      .select()
      .from(kolActivation)
      .where(
        and(
          eq(kolActivation.clientId, c.id),
          inArray(kolActivation.period, [curMonth, prevMonth]),
        ),
      ),
    db
      .select()
      .from(offlineMetric)
      .where(
        and(
          eq(offlineMetric.clientId, c.id),
          inArray(offlineMetric.period, [curMonth, prevMonth]),
        ),
      ),
  ]);
  const kolCur = aggregateKol(kolRows.filter((k) => k.period === curMonth));
  const kolPrev = aggregateKol(kolRows.filter((k) => k.period === prevMonth));
  const revCur = revRows.find((r) => r.period === curMonth);
  const revPrev = revRows.find((r) => r.period === prevMonth);

  // helpers to read platform numbers safely
  const igC = ig?.current,
    igP = ig?.previous,
    ttC = tiktok?.current,
    ttP = tiktok?.previous,
    gmbC = gmb?.current,
    gmbP = gmb?.previous,
    mC = metaCur?.summary,
    mP = metaPrev?.summary;

  const realOmsetCur = revCur ? Number(revCur.revenue) : 0;
  const realOmsetPrev = revPrev ? Number(revPrev.revenue) : 0;
  const spentCur = (mC?.spend ?? 0) + kolCur.totalCost;
  const spentPrev = (mP?.spend ?? 0) + kolPrev.totalCost;
  const imprCur = (igC?.views ?? 0) + (ttC?.views ?? 0) + (mC?.impressions ?? 0) + (gmbC?.impressions ?? 0);
  const imprPrev = (igP?.views ?? 0) + (ttP?.views ?? 0) + (mP?.impressions ?? 0) + (gmbP?.impressions ?? 0);
  const reachCur = (igC?.reach ?? 0) + (ttC?.reach ?? 0) + (mC?.reach ?? 0);
  const reachPrev = (igP?.reach ?? 0) + (ttP?.reach ?? 0) + (mP?.reach ?? 0);
  const interCur = (igC?.engagement ?? 0) + (ttC?.engagement ?? 0) + kolCur.interaction;
  const interPrev = (igP?.engagement ?? 0) + (ttP?.engagement ?? 0) + kolPrev.interaction;

  // Action: auto Meta metrics + Page View (manual, shown only if filled).
  const actionItems: Metric[] = [
    { label: "Click Links", cur: mC?.clicks ?? 0, prev: mP?.clicks ?? 0, fmt: "num" },
    { label: "Click Through Rate", cur: mC?.ctr ?? 0, prev: mP?.ctr ?? 0, fmt: "pct" },
    { label: "Total Leads", cur: mC?.leads ?? 0, prev: mP?.leads ?? 0, fmt: "num" },
  ];
  if (revCur?.pageView != null || revPrev?.pageView != null) {
    actionItems.push({
      label: "Page View",
      cur: revCur?.pageView ?? 0,
      prev: revPrev?.pageView ?? 0,
      fmt: "num",
    });
  }

  // Purchase: manual per-client metrics — show only the ones with data so the
  // dashboard adapts (hotel → OTA/WhatsApp, online → conversion/revenue).
  const num = (v: number | null | undefined) => (v == null ? null : v);
  const purchaseDefs: [string, number | null, number | null, Fmt][] = [
    ["Click Link OTA", num(revCur?.clickOta), num(revPrev?.clickOta), "num"],
    ["Click Link WhatsApp", num(revCur?.clickWhatsapp), num(revPrev?.clickWhatsapp), "num"],
    ["Total Conversion Online", num(revCur?.conversionOnline), num(revPrev?.conversionOnline), "num"],
    [
      "Total Revenue Online",
      revCur?.revenueOnline != null ? Number(revCur.revenueOnline) : null,
      revPrev?.revenueOnline != null ? Number(revPrev.revenueOnline) : null,
      "rp",
    ],
  ];
  const purchaseItems: Metric[] = purchaseDefs
    .filter(([, c, p]) => c != null || p != null)
    .map(([label, c, p, fmt]) => ({ label, cur: c ?? 0, prev: p ?? 0, fmt }));

  const sections: { title: string; items: Metric[] }[] = [
    {
      title: "Profitability Marketing",
      items: [
        { label: "Real Omset", cur: realOmsetCur, prev: realOmsetPrev, fmt: "rp" },
        { label: "Marketing Spent", cur: spentCur, prev: spentPrev, fmt: "rp" },
        {
          label: "Marketing Cost % of Revenue",
          cur: realOmsetCur > 0 ? (spentCur / realOmsetCur) * 100 : 0,
          prev: realOmsetPrev > 0 ? (spentPrev / realOmsetPrev) * 100 : 0,
          fmt: "pct",
        },
      ],
    },
    {
      title: "Brand Awareness",
      items: [
        { label: "Content Impression", cur: imprCur, prev: imprPrev, fmt: "num" },
        { label: "Audience Reach", cur: reachCur, prev: reachPrev, fmt: "num" },
      ],
    },
    {
      title: "Consideration",
      items: [
        { label: "Post Interaction", cur: interCur, prev: interPrev, fmt: "num" },
        {
          label: "Engagement Rate by Reach",
          cur: reachCur > 0 ? (interCur / reachCur) * 100 : 0,
          prev: reachPrev > 0 ? (interPrev / reachPrev) * 100 : 0,
          fmt: "pct",
        },
        {
          label: "Audience Follow",
          cur: (igC?.newFollowers ?? 0) + (ttC?.newFollowers ?? 0),
          prev: (igP?.newFollowers ?? 0) + (ttP?.newFollowers ?? 0),
          fmt: "num",
        },
      ],
    },
    { title: "Action", items: actionItems },
    ...(purchaseItems.length
      ? [{ title: "Purchase", items: purchaseItems }]
      : []),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard Marketing Performance"
        description={`${c.name} · ${formatRangeJakarta(resolved.current.from, resolved.current.to)} · vs ${formatRangeJakarta(resolved.previous.from, resolved.previous.to)}`}
      >
        <PulseFilters
          clients={clients.map((x) => ({ id: x.id, name: x.name }))}
          selectedClient={c.id}
          from={from}
          to={to}
          nowMonth={nowMonth}
          isCustom={isCustom}
        />
      </PageHeader>

      {sections.map((sec) => (
        <div key={sec.title} className="space-y-2.5">
          <p className="border-b pb-1.5 text-sm font-semibold tracking-tight text-foreground">
            {sec.title}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sec.items.map((m) => {
              const d = delta(m);
              const up = (d ?? 0) >= 0;
              return (
                <div
                  key={m.label}
                  className="rounded-xl border bg-card p-3 shadow-card sm:p-4"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {m.label}
                    </p>
                    {d === null ? (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[11px] font-medium",
                          up
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {up ? (
                          <ArrowUpRight className="size-3" />
                        ) : (
                          <ArrowDownRight className="size-3" />
                        )}
                        {Math.abs(d)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-lg font-bold tabular-nums sm:mt-2 sm:text-2xl">
                    {valueStr(m)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
