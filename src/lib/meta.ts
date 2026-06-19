import { getMetaToken, isMetaEnabled } from "./config";

/**
 * Meta (Facebook) Ads insights via Graph API. 8s timeout + 30 min cache so a
 * slow Graph API never wedges the page (anti-stuck). Token from env.
 */
const GRAPH = "https://graph.facebook.com/v21.0";

export async function isMetaConfigured(): Promise<boolean> {
  const [on, token] = await Promise.all([isMetaEnabled(), getMetaToken()]);
  return on && Boolean(token);
}

type Action = { action_type: string; value: string };
type InsightRow = {
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  actions?: Action[];
  date_start?: string;
};

const num = (v: string | undefined): number => Number(v) || 0;

/** Value of a single action_type in an actions array (0 if missing). */
function actionVal(actions: Action[] | undefined, type: string): number {
  if (!Array.isArray(actions)) return 0;
  return Number(actions.find((a) => a.action_type === type)?.value || 0);
}

/** Leads proxy for F&B accounts: messaging conversations started, else lead. */
function leadsFrom(actions?: Action[]): number {
  return (
    actionVal(actions, "onsite_conversion.messaging_conversation_started_7d") ||
    actionVal(actions, "onsite_conversion.total_messaging_connection") ||
    actionVal(actions, "lead") ||
    0
  );
}

async function fetchInsights(
  accountId: string,
  params: Record<string, string>,
): Promise<InsightRow[]> {
  const token = await getMetaToken();
  if (!token) throw new Error("META_ACCESS_TOKEN belum di-set");
  const url = new URL(`${GRAPH}/act_${accountId}/insights`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 1800 },
  });
  const json = (await res.json()) as {
    data?: InsightRow[];
    error?: { message: string };
  };
  if (json.error) throw new Error(`Meta: ${json.error.message}`);
  if (!res.ok) throw new Error(`Meta API ${res.status}`);
  return json.data ?? [];
}

export type MetaAdAccount = { id: string; name: string };

/**
 * List ad accounts the configured token can access, so the client form can
 * offer them as a dropdown (display name, store account_id). Returns [] when
 * unconfigured/down (anti-stuck) — never throws.
 */
export async function listMetaAdAccounts(): Promise<MetaAdAccount[]> {
  const token = await getMetaToken();
  if (!token) return [];
  try {
    const url = new URL(`${GRAPH}/me/adaccounts`);
    url.searchParams.set("access_token", token);
    url.searchParams.set("fields", "account_id,name");
    url.searchParams.set("limit", "200");
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 1800 },
    });
    const json = (await res.json()) as {
      data?: { account_id: string; name?: string }[];
      error?: { message: string };
    };
    if (json.error || !res.ok) return [];
    return (json.data ?? [])
      .map((a) => ({ id: a.account_id, name: a.name || a.account_id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export type MetaSummary = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  /** Cost per click (Rp) = spend / clicks. */
  cpc: number;
  /** Cost per mille (Rp) = spend / impressions * 1000. */
  cpm: number;
  /** Cost per lead (Rp) = spend / leads; null when no leads (avoid /0). */
  cpl: number | null;
  /** Total post engagement (reactions, comments, shares, clicks, etc). */
  engagement: number;
  /** Engagement rate % = engagement / impressions * 100 (Meta-only). */
  er: number;
  /** Landing page views (action_type landing_page_view). */
  landingPageViews: number;
  leads: number;
};

export type MetaDailyPoint = { date: string; spend: number; leads: number };

export type MetaPerf = { summary: MetaSummary; daily: MetaDailyPoint[] };

export type MetaRange =
  | { preset: string }
  | { from: string; to: string };

function rangeParams(range: MetaRange): Record<string, string> {
  if ("from" in range) {
    return {
      time_range: JSON.stringify({ since: range.from, until: range.to }),
    };
  }
  return { date_preset: range.preset };
}

export async function getMetaPerf(
  accountId: string,
  range: MetaRange = { preset: "last_30d" },
): Promise<MetaPerf | null> {
  const rp = rangeParams(range);
  const [summaryRows, dailyRows] = await Promise.all([
    fetchInsights(accountId, {
      fields: "spend,impressions,reach,clicks,ctr,cpc,actions",
      ...rp,
    }),
    fetchInsights(accountId, {
      fields: "spend,actions",
      time_increment: "1",
      ...rp,
    }),
  ]);

  const s = summaryRows[0];
  if (!s) return null;

  const spend = num(s.spend);
  const impressions = num(s.impressions);
  const clicks = num(s.clicks);
  const leads = dailyRows.reduce((a, r) => a + leadsFrom(r.actions), 0);
  const engagement = actionVal(s.actions, "post_engagement");
  const landingPageViews = actionVal(s.actions, "landing_page_view");

  const summary: MetaSummary = {
    spend,
    impressions,
    reach: num(s.reach),
    clicks,
    ctr: Math.round(num(s.ctr) * 100) / 100,
    // Cost metrics derived from spend so they always agree with the totals.
    cpc: clicks > 0 ? Math.round(spend / clicks) : 0,
    cpm: impressions > 0 ? Math.round((spend / impressions) * 1000) : 0,
    cpl: leads > 0 ? Math.round(spend / leads) : null,
    engagement,
    er: impressions > 0 ? Math.round((engagement / impressions) * 10000) / 100 : 0,
    landingPageViews,
    leads,
  };
  const daily: MetaDailyPoint[] = dailyRows.map((r) => ({
    date: r.date_start ?? "",
    spend: num(r.spend),
    leads: leadsFrom(r.actions),
  }));

  return { summary, daily };
}
