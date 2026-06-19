"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  MapPin,
  Megaphone,
} from "lucide-react";
import {
  InstagramIcon,
  MetaIcon,
  TiktokIcon,
} from "@/components/channel-icons";
import { MiniChart } from "@/components/mini-chart";
import { cn } from "@/lib/utils";
import { deltaPct, fmtNum as fmt, rp } from "@/lib/format";
import type { PlatformSummary, TopPost } from "@/lib/windsor";
import { MetaRangeFilter } from "./meta-range-filter";
import type { ClientData, GmbData, IgData, KolData, TiktokData } from "./types";

function DeltaPill({ cur, prev }: { cur: number; prev: number }) {
  const d = deltaPct(cur, prev);
  if (d === null) return <span className="text-[11px] text-muted-foreground">—</span>;
  const up = d >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
        up
          ? "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300",
      )}
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(d)}%
    </span>
  );
}

function Tile({
  label,
  value,
  cur,
  prev,
}: {
  label: string;
  value: string;
  cur?: number;
  prev?: number;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <p className="text-lg font-semibold leading-none tabular-nums">{value}</p>
        {cur !== undefined && prev !== undefined && <DeltaPill cur={cur} prev={prev} />}
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  name,
  badge,
}: {
  icon: React.ReactNode;
  name: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-muted-foreground">{icon}</span>
        {name}
      </span>
      {badge && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
          {badge}
        </span>
      )}
    </div>
  );
}

function OrganicGrid({
  cur,
  prev,
}: {
  cur: PlatformSummary;
  prev: PlatformSummary;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      <Tile label="Reach" value={fmt(cur.reach)} cur={cur.reach} prev={prev.reach} />
      <Tile label="Views" value={fmt(cur.views)} cur={cur.views} prev={prev.views} />
      <Tile label="Engagement" value={fmt(cur.engagement)} cur={cur.engagement} prev={prev.engagement} />
      <Tile label="Eng. Rate" value={`${cur.er}%`} cur={cur.er} prev={prev.er} />
      <Tile label="New followers" value={fmt(cur.newFollowers)} cur={cur.newFollowers} prev={prev.newFollowers} />
    </div>
  );
}

function TopPosts({ posts }: { posts: TopPost[] }) {
  if (posts.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Top posts</p>
      <div className="grid gap-1.5 sm:grid-cols-3">
        {posts.map((p, i) => (
          <a
            key={i}
            href={p.permalink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded bg-primary/10 text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-xs text-muted-foreground">{fmt(p.engagement)} eng</span>
            </span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
}

function IgSection({ ig }: { ig: IgData }) {
  return (
    <div className="space-y-3">
      <SectionHeader
        icon={<InstagramIcon className="size-4" />}
        name="Instagram"
        badge={`${fmt(ig.current.followers)} followers`}
      />
      <OrganicGrid cur={ig.current} prev={ig.previous} />
      <TopPosts posts={ig.top} />
    </div>
  );
}

function TiktokSection({ tiktok }: { tiktok: TiktokData }) {
  return (
    <div className="space-y-3 border-t pt-5">
      <SectionHeader
        icon={<TiktokIcon className="size-4" />}
        name="TikTok"
        badge={`${fmt(tiktok.current.followers)} followers`}
      />
      <OrganicGrid cur={tiktok.current} prev={tiktok.previous} />
      <TopPosts posts={tiktok.top} />
    </div>
  );
}

function GmbSection({ gmb }: { gmb: GmbData }) {
  const cur = gmb.current;
  const prev = gmb.previous;
  return (
    <div className="space-y-3 border-t pt-5">
      <SectionHeader
        icon={<MapPin className="size-4" />}
        name="Google Maps"
        badge={
          cur.reviews > 0
            ? `${cur.rating.toFixed(1)} ★ · ${fmt(cur.reviews)} review`
            : undefined
        }
      />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <Tile label="Impressions" value={fmt(cur.impressions)} cur={cur.impressions} prev={prev.impressions} />
        <Tile label="Calls" value={fmt(cur.calls)} cur={cur.calls} prev={prev.calls} />
        <Tile label="Directions" value={fmt(cur.directions)} cur={cur.directions} prev={prev.directions} />
        <Tile label="Website" value={fmt(cur.websiteClicks)} cur={cur.websiteClicks} prev={prev.websiteClicks} />
        <Tile label="Food orders" value={fmt(cur.foodOrders)} cur={cur.foodOrders} prev={prev.foodOrders} />
        <Tile label="Rating" value={cur.reviews > 0 ? `${cur.rating.toFixed(1)}★` : "—"} />
      </div>
    </div>
  );
}

function MetaSection({ meta }: { meta: ClientData["meta"] }) {
  if (!meta) return null;
  const s = meta.summary;
  return (
    <div className="space-y-3 border-t pt-5">
      <SectionHeader
        icon={<MetaIcon className="size-4" />}
        name="Meta Ads"
        badge={`${rp(s.spend)} spend`}
      />
      {/* Tiles ordered as a funnel: budget → awareness → engagement →
          traffic → landing → conversion (each volume next to its cost/rate). */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <Tile label="Spend" value={rp(s.spend)} />
        <Tile label="Impressions" value={fmt(s.impressions)} />
        <Tile label="Reach" value={fmt(s.reach)} />
        <Tile label="CPM" value={rp(s.cpm)} />
        <Tile label="Engagement" value={fmt(s.engagement)} />
        <Tile label="Eng. Rate" value={`${s.er}%`} />
        <Tile label="Clicks" value={fmt(s.clicks)} />
        <Tile label="CTR" value={`${s.ctr}%`} />
        <Tile label="CPC" value={rp(s.cpc)} />
        <Tile label="LP Views" value={fmt(s.landingPageViews)} />
        <Tile label="Leads (WA)" value={fmt(s.leads)} />
        <Tile label="CPL" value={s.cpl === null ? "—" : rp(s.cpl)} />
      </div>
      <div className="rounded-lg border bg-background p-3">
        <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          Spend harian
        </p>
        <MiniChart data={meta.daily.map((d) => ({ date: d.date, value: d.spend }))} format={rp} />
      </div>
    </div>
  );
}

function KolSection({ kol }: { kol: KolData }) {
  const a = kol.aggregate;
  return (
    <div className="space-y-3 border-t pt-5">
      <SectionHeader
        icon={<Megaphone className="size-4" />}
        name="KOL"
        badge={`${rp(a.totalCost)} spend`}
      />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <Tile label="KOL" value={fmt(a.kolCount)} />
        <Tile label="Post" value={fmt(a.postCount)} />
        <Tile label="Reach" value={fmt(a.reach)} />
        <Tile label="Impressions" value={fmt(a.impressions)} />
        <Tile label="Interaction" value={fmt(a.interaction)} />
        <Tile label="ER %" value={`${a.er}%`} />
        <Tile label="Total Cost" value={rp(a.totalCost)} />
        <Tile label="CPE" value={rp(a.cpe)} />
        <Tile label="CPV" value={rp(a.cpv)} />
      </div>
      {kol.top.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Top 3 post (by interaction)
          </p>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {kol.top.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded bg-primary/10 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="truncate">
                    <span className="font-medium">{p.username}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      {fmt(p.interaction)} int
                    </span>
                  </span>
                </span>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PerformancePanel({
  clients,
  windsorConfigured,
  metaConfigured,
  rangeValue,
  rangeFrom,
  rangeTo,
  currentLabel,
  previousLabel,
}: {
  clients: ClientData[];
  windsorConfigured: boolean;
  metaConfigured: boolean;
  rangeValue: string;
  rangeFrom?: string;
  rangeTo?: string;
  currentLabel: string;
  previousLabel: string;
}) {
  const [active, setActive] = useState(0);

  if (!windsorConfigured && !metaConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
        Belum ada integrasi. Set <code>WINDSOR_API_KEY</code> dan/atau{" "}
        <code>META_ACCESS_TOKEN</code> di env.
      </div>
    );
  }
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-xs">
        Belum ada klien yang dipetakan ke akun Windsor / Meta. Atur di menu
        Clients.
      </div>
    );
  }

  const c = clients[Math.min(active, clients.length - 1)];

  return (
    <div className="space-y-4">
      {/* Global date filter (drives IG, TikTok & Meta) + client tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {clients.map((cl, i) => (
            <button
              key={cl.id}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                i === active
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background text-muted-foreground hover:bg-accent",
              )}
            >
              {cl.name}
            </button>
          ))}
        </div>
        {(windsorConfigured || metaConfigured) && (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Periode:
            </span>
            <MetaRangeFilter value={rangeValue} from={rangeFrom} to={rangeTo} />
          </div>
        )}
      </div>

      {/* Explicit window + freshness so the numbers are never ambiguous. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>
          Data: <span className="font-medium text-foreground">{currentLabel}</span>{" "}
          · vs {previousLabel}
        </span>
        <span className="hidden sm:inline">·</span>
        <span>
          Organic &amp; Maps via Windsor (sinkron berkala) · Meta Ads ~real-time
          · cache 30 mnt
        </span>
      </div>

      <div className="space-y-5 rounded-xl border bg-card p-5 shadow-card">
        <h3 className="font-semibold">{c.name}</h3>
        {c.ig && <IgSection ig={c.ig} />}
        {c.tiktok && <TiktokSection tiktok={c.tiktok} />}
        {c.gmb && <GmbSection gmb={c.gmb} />}
        {c.meta && <MetaSection meta={c.meta} />}
        {c.kol && <KolSection kol={c.kol} />}
        {!c.ig && !c.tiktok && !c.gmb && !c.meta && !c.kol && (
          <p className="text-sm text-muted-foreground">
            Tidak ada data untuk klien ini.
          </p>
        )}
      </div>
    </div>
  );
}
