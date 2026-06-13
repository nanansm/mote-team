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

/** Leads proxy for F&B accounts: messaging conversations started, else lead. */
function leadsFrom(actions?: Action[]): number {
  if (!Array.isArray(actions)) return 0;
  const get = (t: string) =>
    Number(actions.find((a) => a.action_type === t)?.value || 0);
  return (
    get("onsite_conversion.messaging_conversation_started_7d") ||
    get("onsite_conversion.total_messaging_connection") ||
    get("lead") ||
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

export type MetaSummary = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
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
      fields: "spend,impressions,reach,clicks,ctr,cpc",
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

  const summary: MetaSummary = {
    spend: num(s.spend),
    impressions: num(s.impressions),
    reach: num(s.reach),
    clicks: num(s.clicks),
    ctr: Math.round(num(s.ctr) * 100) / 100,
    cpc: Math.round(num(s.cpc)),
    leads: dailyRows.reduce((a, r) => a + leadsFrom(r.actions), 0),
  };
  const daily: MetaDailyPoint[] = dailyRows.map((r) => ({
    date: r.date_start ?? "",
    spend: num(r.spend),
    leads: leadsFrom(r.actions),
  }));

  return { summary, daily };
}
