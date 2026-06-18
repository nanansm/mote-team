"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Megaphone,
} from "lucide-react";
import { InstagramIcon, TiktokIcon } from "@/components/channel-icons";
import { MiniChart } from "@/components/mini-chart";
import { cn } from "@/lib/utils";
import type { PlatformSummary } from "@/lib/windsor";
import { MetaRangeFilter } from "./meta-range-filter";
import type { ClientData, IgData, TiktokData } from "./types";

const fmt = (n: number) => n.toLocaleString("id-ID");
const rp = (n: number) =>
  n >= 1_000_000
    ? `Rp${(n / 1_000_000).toFixed(1)}jt`
    : `Rp${n.toLocaleString("id-ID")}`;

function deltaPct(cur: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

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
  color,
}: {
  icon: React.ReactNode;
  name: string;
  badge?: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className={cn("grid size-7 place-items-center rounded-md", color)}>
          {icon}
        </span>
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

function IgSection({ ig }: { ig: IgData }) {
  return (
    <div className="space-y-3">
      <SectionHeader
        icon={<InstagramIcon className="size-4 text-white" />}
        name="Instagram"
        badge={`${fmt(ig.current.followers)} followers`}
        color="bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white"
      />
      <OrganicGrid cur={ig.current} prev={ig.previous} />
      {ig.top.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Top posts</p>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {ig.top.map((p, i) => (
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
      )}
    </div>
  );
}

function TiktokSection({ tiktok }: { tiktok: TiktokData }) {
  return (
    <div className="space-y-3 border-t pt-5">
      <SectionHeader
        icon={<TiktokIcon className="size-4 text-white" />}
        name="TikTok"
        badge={`${fmt(tiktok.current.followers)} followers`}
        color="bg-black text-white"
      />
      <OrganicGrid cur={tiktok.current} prev={tiktok.previous} />
    </div>
  );
}

function MetaSection({ meta }: { meta: ClientData["meta"] }) {
  if (!meta) return null;
  const s = meta.summary;
  return (
    <div className="space-y-3 border-t pt-5">
      <SectionHeader
        icon={<Megaphone className="size-4 text-white" />}
        name="Meta Ads"
        badge={`${rp(s.spend)} spend`}
        color="bg-blue-600 text-white"
      />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <Tile label="Spend" value={rp(s.spend)} />
        <Tile label="Reach" value={fmt(s.reach)} />
        <Tile label="Impressions" value={fmt(s.impressions)} />
        <Tile label="Clicks" value={fmt(s.clicks)} />
        <Tile label="CTR" value={`${s.ctr}%`} />
        <Tile label="Leads (WA)" value={fmt(s.leads)} />
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

export function PerformancePanel({
  clients,
  windsorConfigured,
  metaConfigured,
  rangeValue,
  rangeFrom,
  rangeTo,
}: {
  clients: ClientData[];
  windsorConfigured: boolean;
  metaConfigured: boolean;
  rangeValue: string;
  rangeFrom?: string;
  rangeTo?: string;
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

      <div className="space-y-5 rounded-xl border bg-card p-5 shadow-card">
        <h3 className="font-semibold">{c.name}</h3>
        {c.ig && <IgSection ig={c.ig} />}
        {c.tiktok && <TiktokSection tiktok={c.tiktok} />}
        {c.meta && <MetaSection meta={c.meta} />}
        {!c.ig && !c.tiktok && !c.meta && (
          <p className="text-sm text-muted-foreground">
            Tidak ada data untuk klien ini.
          </p>
        )}
      </div>
    </div>
  );
}
