import { getWindsorKey, isWindsorEnabled } from "./config";
import type { ResolvedRange } from "./date-range";

/**
 * Windsor.ai REST client for organic performance (report-style).
 *
 * Strategy: one fetch per dataset (no per-account filter — Windsor's `accounts`
 * param is unreliable here), grouped by `account_name` in code. Every call has
 * an 8s timeout and results are cached 30 min so a slow/down Windsor never
 * wedges a page (anti-stuck). Clients map to an account via its `account_name`.
 */
const BASE = "https://connectors.windsor.ai";

export async function isWindsorConfigured(): Promise<boolean> {
  const [on, key] = await Promise.all([isWindsorEnabled(), getWindsorKey()]);
  return on && Boolean(key);
}

type Row = Record<string, string | number | null>;
type Range = { from: string; to: string };

const num = (v: string | number | null | undefined): number =>
  typeof v === "number" ? v : Number(v) || 0;

/** Run a fetch that resolves to [] on any failure, so one dead connector
 *  (timeout, 400, IG up but TikTok down) never blanks the whole panel. */
const safe = (p: Promise<Row[]>): Promise<Row[]> => p.catch(() => []);

async function fetchRows(
  connector: string,
  fields: string[],
  range?: Range,
): Promise<Row[]> {
  const apiKey = await getWindsorKey();
  if (!apiKey) throw new Error("WINDSOR_API_KEY belum di-set");
  const p = new URLSearchParams();
  p.set("api_key", apiKey);
  p.set("fields", fields.join(","));
  if (range) {
    p.set("date_from", range.from);
    p.set("date_to", range.to);
  }
  const res = await fetch(`${BASE}/${connector}?${p.toString()}`, {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`Windsor ${connector} ${res.status}`);
  const json = (await res.json()) as { data?: Row[] };
  return json.data ?? [];
}

/* ---------------------------------------------------------------- summary */

export type PlatformSummary = {
  reach: number;
  views: number;
  engagement: number;
  newFollowers: number;
  followers: number;
  /** engagement rate % = engagement / reach */
  er: number;
};

export type TopPost = {
  permalink: string;
  type: string;
  engagement: number;
  reach: number;
  thumbnail: string | null;
};

export type ClientPerformance = {
  ig?: { current: PlatformSummary; previous: PlatformSummary; top: TopPost[] };
  tiktok?: { current: PlatformSummary; previous: PlatformSummary };
};

function groupByAccount(rows: Row[]): Map<string, Row[]> {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const name = String(r.account_name ?? "");
    if (!name) continue;
    const list = m.get(name);
    if (list) list.push(r);
    else m.set(name, [r]);
  }
  return m;
}

const er = (engagement: number, reach: number) =>
  reach > 0 ? Math.round((engagement / reach) * 1000) / 10 : 0;

/**
 * Pull every connected account's organic metrics in a handful of cached calls
 * and return per-account-name maps the page can look up by client mapping.
 */
export async function getAllOrganic(range: ResolvedRange): Promise<{
  ig: Map<string, ClientPerformance["ig"]>;
  tiktok: Map<string, ClientPerformance["tiktok"]>;
}> {
  const { current, previous, includeFollowerDelta } = range;

  // follower_count_1d only supports the last 30 days → include only when the
  // selected window is within that, to avoid a 400.
  const igCurFields = [
    "account_name", "date", "reach", "views", "total_interactions",
    ...(includeFollowerDelta ? ["follower_count_1d"] : []),
  ];

  const [
    igCur,
    igPrev,
    igFollowers,
    igMedia,
    ttCur,
    ttPrev,
    ttFollowers,
  ] = await Promise.all([
    safe(fetchRows("instagram", igCurFields, current)),
    safe(fetchRows("instagram", ["account_name", "date", "reach", "views", "total_interactions"], previous)),
    safe(fetchRows("instagram", ["account_name", "followers_count"])),
    safe(fetchRows("instagram", ["account_name", "media_permalink", "media_type", "media_engagement", "media_reach", "media_thumbnail_url", "timestamp"], current)),
    safe(fetchRows("tiktok_organic", ["account_name", "date", "unique_video_views", "video_views", "likes", "comments", "shares", "followers_count"], current)),
    safe(fetchRows("tiktok_organic", ["account_name", "date", "unique_video_views", "video_views", "likes", "comments", "shares", "followers_count"], previous)),
    safe(fetchRows("tiktok_organic", ["account_name", "total_followers_count"])),
  ]);

  const igFollowerMap = new Map<string, number>();
  for (const r of igFollowers) igFollowerMap.set(String(r.account_name), num(r.followers_count));
  const ttFollowerMap = new Map<string, number>();
  for (const r of ttFollowers) ttFollowerMap.set(String(r.account_name), num(r.total_followers_count));

  const igSummary = (rows: Row[], followers: number): PlatformSummary => {
    const reach = rows.reduce((s, r) => s + num(r.reach), 0);
    const views = rows.reduce((s, r) => s + num(r.views), 0);
    const engagement = rows.reduce((s, r) => s + num(r.total_interactions), 0);
    const newFollowers = rows.reduce((s, r) => s + num(r.follower_count_1d), 0);
    return { reach, views, engagement, newFollowers, followers, er: er(engagement, reach) };
  };
  const ttSummary = (rows: Row[], followers: number): PlatformSummary => {
    const reach = rows.reduce((s, r) => s + num(r.unique_video_views), 0);
    const views = rows.reduce((s, r) => s + num(r.video_views), 0);
    const engagement = rows.reduce(
      (s, r) => s + num(r.likes) + num(r.comments) + num(r.shares),
      0,
    );
    const newFollowers = rows.reduce((s, r) => s + num(r.followers_count), 0);
    return { reach, views, engagement, newFollowers, followers, er: er(engagement, reach) };
  };

  const igCurByAcc = groupByAccount(igCur);
  const igPrevByAcc = groupByAccount(igPrev);
  const igMediaByAcc = groupByAccount(igMedia);
  const ttCurByAcc = groupByAccount(ttCur);
  const ttPrevByAcc = groupByAccount(ttPrev);

  const ig = new Map<string, ClientPerformance["ig"]>();
  for (const name of igCurByAcc.keys()) {
    const followers = igFollowerMap.get(name) ?? 0;
    const top: TopPost[] = (igMediaByAcc.get(name) ?? [])
      .map((r) => ({
        permalink: String(r.media_permalink ?? ""),
        type: String(r.media_type ?? ""),
        engagement: num(r.media_engagement),
        reach: num(r.media_reach),
        thumbnail: r.media_thumbnail_url ? String(r.media_thumbnail_url) : null,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);
    ig.set(name, {
      current: igSummary(igCurByAcc.get(name) ?? [], followers),
      previous: igSummary(igPrevByAcc.get(name) ?? [], followers),
      top,
    });
  }

  const tiktok = new Map<string, ClientPerformance["tiktok"]>();
  for (const name of ttCurByAcc.keys()) {
    const followers = ttFollowerMap.get(name) ?? 0;
    tiktok.set(name, {
      current: ttSummary(ttCurByAcc.get(name) ?? [], followers),
      previous: ttSummary(ttPrevByAcc.get(name) ?? [], followers),
    });
  }

  return { ig, tiktok };
}

export function deltaPct(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}
