import { getMetaToken, isIgEnabled } from "./config";
import type { DateWindow, ResolvedRange } from "./date-range";
import type { IgPerf, PlatformSummary, TopPost } from "./social-types";

/**
 * Instagram organic insights via Meta Graph API (direct — replaces Windsor).
 * Reuses the Meta token (scope instagram_manage_insights). 8s timeout + 30 min
 * cache per fetch (anti-stuck), every metric isolated so one failing metric
 * yields 0 instead of blanking the client.
 */
const GRAPH = "https://graph.facebook.com/v21.0";

const num = (v: unknown): number => Number(v) || 0;

export async function isIgConfigured(): Promise<boolean> {
  const [on, token] = await Promise.all([isIgEnabled(), getMetaToken()]);
  return on && Boolean(token);
}

/** Unix seconds for a YYYY-MM-DD (UTC midnight; `end` = next-day midnight). */
function unix(ymd: string, end = false): number {
  const ms = Date.parse(`${ymd}T00:00:00Z`) + (end ? 86_400_000 : 0);
  return Math.floor(ms / 1000);
}

async function igGet(
  path: string,
  params: Record<string, string>,
): Promise<{ data?: unknown[]; error?: { message: string } } & Record<string, unknown>> {
  const token = await getMetaToken();
  if (!token) throw new Error("META token belum di-set");
  const url = new URL(`${GRAPH}/${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 1800 },
  });
  return res.json();
}

type InsightRow = {
  total_value?: { value?: number };
  values?: { value?: number }[];
};

/** Aggregate one account-level metric over a window. 0 on any error (isolated). */
async function metricAgg(
  igId: string,
  metric: string,
  win: DateWindow,
  totalValue = false,
): Promise<number> {
  try {
    const p: Record<string, string> = {
      metric,
      period: "day",
      since: String(unix(win.from)),
      until: String(unix(win.to, true)),
    };
    if (totalValue) p.metric_type = "total_value";
    const j = await igGet(`${igId}/insights`, p);
    if (j.error) return 0;
    const row = (j.data?.[0] ?? {}) as InsightRow;
    if (row.total_value) return num(row.total_value.value);
    return (row.values ?? []).reduce((s, v) => s + num(v.value), 0);
  } catch {
    return 0;
  }
}

async function windowSummary(
  igId: string,
  win: DateWindow,
  followers: number,
  withFollowerDelta: boolean,
): Promise<PlatformSummary> {
  const [reach, views, engagement, newFollowers] = await Promise.all([
    metricAgg(igId, "reach", win),
    metricAgg(igId, "views", win, true),
    metricAgg(igId, "total_interactions", win, true),
    withFollowerDelta ? metricAgg(igId, "follower_count", win) : Promise.resolve(0),
  ]);
  return {
    reach,
    views,
    engagement,
    newFollowers,
    followers,
    er: reach > 0 ? Math.round((engagement / reach) * 1000) / 10 : 0,
  };
}

type MediaRow = {
  id: string;
  permalink?: string;
  media_type?: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string;
  media_url?: string;
  timestamp?: string;
};

async function topPosts(igId: string, win: DateWindow): Promise<TopPost[]> {
  try {
    const j = await igGet(`${igId}/media`, {
      fields:
        "permalink,media_type,like_count,comments_count,thumbnail_url,media_url,timestamp",
      since: String(unix(win.from)),
      until: String(unix(win.to, true)),
      limit: "50",
    });
    const rows = ((j.data ?? []) as MediaRow[])
      .map((r) => ({
        permalink: String(r.permalink ?? ""),
        type: String(r.media_type ?? ""),
        engagement: num(r.like_count) + num(r.comments_count),
        reach: 0,
        thumbnail: r.thumbnail_url ?? r.media_url ?? null,
        id: r.id,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);
    // Enrich the 3 top posts with reach (per-media insight; best-effort).
    await Promise.all(
      rows.map(async (r) => {
        try {
          const ins = await igGet(`${r.id}/insights`, { metric: "reach" });
          const v = (ins.data?.[0] as InsightRow | undefined)?.values?.[0]?.value;
          r.reach = num(v);
        } catch {
          /* keep 0 */
        }
      }),
    );
    return rows.map((r) => ({
      permalink: r.permalink,
      type: r.type,
      engagement: r.engagement,
      reach: r.reach,
      thumbnail: r.thumbnail,
    }));
  } catch {
    return [];
  }
}

/**
 * Per-client IG performance (current + previous window + top posts). Returns
 * null if the account can't be read at all. `igUserId` = IG Business account id.
 */
export async function getIgPerf(
  igUserId: string,
  range: ResolvedRange,
): Promise<IgPerf | null> {
  try {
    let followers = 0;
    try {
      const prof = await igGet(igUserId, { fields: "followers_count" });
      if (prof.error) return null;
      followers = num(prof.followers_count);
    } catch {
      return null;
    }
    const [current, previous, top] = await Promise.all([
      windowSummary(igUserId, range.current, followers, range.includeFollowerDelta),
      // follower_count only supports last 30d → never request it for previous.
      windowSummary(igUserId, range.previous, followers, false),
      topPosts(igUserId, range.current),
    ]);
    return { current, previous, top };
  } catch {
    return null;
  }
}

export type IgAccount = { id: string; username: string };

/** IG business accounts the token can reach (for the client-form dropdown). */
export async function listIgAccounts(): Promise<IgAccount[]> {
  const token = await getMetaToken();
  if (!token) return [];
  try {
    const j = await igGet("me/accounts", {
      fields: "instagram_business_account{id,username}",
      limit: "200",
    });
    const out: IgAccount[] = [];
    for (const p of (j.data ?? []) as {
      instagram_business_account?: { id: string; username?: string };
    }[]) {
      const ig = p.instagram_business_account;
      if (ig?.id) out.push({ id: ig.id, username: ig.username || ig.id });
    }
    return out
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
      .sort((a, b) => a.username.localeCompare(b.username));
  } catch {
    return [];
  }
}
