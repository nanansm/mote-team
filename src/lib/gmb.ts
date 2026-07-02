import {
  getGmbClientId,
  getGmbClientSecret,
  getGmbRefreshToken,
  isGmbEnabled,
} from "./config";
import type { DateWindow, ResolvedRange } from "./date-range";
import type { GmbPerf, GmbSummary } from "./social-types";

/**
 * Google Business Profile (Maps) insight via the official APIs (direct —
 * replaces Windsor). OAuth refresh-token flow. Performance API for daily
 * metrics + legacy v4 for reviews (best-effort). Until the project's API
 * access request is approved, calls return 429 → every function degrades to
 * null/0 (anti-stuck), so the GMB section simply hides.
 */
const PERF = "https://businessprofileperformance.googleapis.com/v1";
const ACCTS = "https://mybusinessaccountmanagement.googleapis.com/v1";
const INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";
const num = (v: unknown): number => Number(v) || 0;

const IMPRESSION_METRICS = [
  "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
  "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
  "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
  "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
];
const ACTION_METRICS = [
  "CALL_CLICKS",
  "WEBSITE_CLICKS",
  "BUSINESS_DIRECTION_REQUESTS",
  "BUSINESS_FOOD_ORDERS",
];

export async function isGmbConfigured(): Promise<boolean> {
  const [on, id, secret, refresh] = await Promise.all([
    isGmbEnabled(),
    getGmbClientId(),
    getGmbClientSecret(),
    getGmbRefreshToken(),
  ]);
  return on && Boolean(id && secret && refresh);
}

// Cache the short-lived access token across requests (survives HMR via global).
const g = globalThis as unknown as { __gmbTok?: { token: string; exp: number } };

async function accessToken(): Promise<string | null> {
  if (g.__gmbTok && g.__gmbTok.exp > Date.now() + 60_000) return g.__gmbTok.token;
  const [id, secret, refresh] = await Promise.all([
    getGmbClientId(),
    getGmbClientSecret(),
    getGmbRefreshToken(),
  ]);
  if (!id || !secret || !refresh) return null;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: id,
        client_secret: secret,
        refresh_token: refresh,
        grant_type: "refresh_token",
      }),
      signal: AbortSignal.timeout(8000),
    });
    const j = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!j.access_token) return null;
    g.__gmbTok = {
      token: j.access_token,
      exp: Date.now() + (j.expires_in ?? 3600) * 1000,
    };
    return j.access_token;
  } catch {
    return null;
  }
}

async function gGet(url: string): Promise<Record<string, unknown> | null> {
  const token = await accessToken();
  if (!token) return null;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null; // 429 (quota), 403, etc → graceful
    return res.json();
  } catch {
    return null;
  }
}

type MultiSeries = {
  multiDailyMetricTimeSeries?: {
    dailyMetricTimeSeries?: {
      dailyMetric?: string;
      timeSeries?: { datedValues?: { value?: string }[] };
    }[];
  }[];
};

function sumByMetric(j: MultiSeries | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (const block of j?.multiDailyMetricTimeSeries ?? []) {
    for (const s of block.dailyMetricTimeSeries ?? []) {
      const total = (s.timeSeries?.datedValues ?? []).reduce(
        (a, d) => a + num(d.value),
        0,
      );
      out[s.dailyMetric ?? ""] = total;
    }
  }
  return out;
}

async function windowMetrics(
  locationId: string,
  win: DateWindow,
): Promise<Record<string, number>> {
  const [fy, fm, fd] = win.from.split("-");
  const [ty, tm, td] = win.to.split("-");
  const p = new URLSearchParams();
  [...IMPRESSION_METRICS, ...ACTION_METRICS].forEach((m) => p.append("dailyMetrics", m));
  p.set("dailyRange.start_date.year", fy);
  p.set("dailyRange.start_date.month", String(Number(fm)));
  p.set("dailyRange.start_date.day", String(Number(fd)));
  p.set("dailyRange.end_date.year", ty);
  p.set("dailyRange.end_date.month", String(Number(tm)));
  p.set("dailyRange.end_date.day", String(Number(td)));
  const j = (await gGet(
    `${PERF}/${locationId}:fetchMultiDailyMetricsTimeSeries?${p}`,
  )) as MultiSeries | null;
  return sumByMetric(j);
}

function toSummary(
  m: Record<string, number>,
  review: { rating: number; reviews: number },
): GmbSummary {
  const impressions = IMPRESSION_METRICS.reduce((s, k) => s + (m[k] ?? 0), 0);
  return {
    impressions,
    calls: m.CALL_CLICKS ?? 0,
    websiteClicks: m.WEBSITE_CLICKS ?? 0,
    directions: m.BUSINESS_DIRECTION_REQUESTS ?? 0,
    foodOrders: m.BUSINESS_FOOD_ORDERS ?? 0,
    rating: review.rating,
    reviews: review.reviews,
  };
}

/** Reviews snapshot via legacy v4 (best-effort; 0 if not resolvable). */
async function reviewSnapshot(locationId: string): Promise<{ rating: number; reviews: number }> {
  const zero = { rating: 0, reviews: 0 };
  try {
    const accounts = (await gGet(`${ACCTS}/accounts?pageSize=20`)) as {
      accounts?: { name?: string }[];
    } | null;
    const account = accounts?.accounts?.[0]?.name; // "accounts/123"
    if (!account) return zero;
    const bare = locationId.replace(/^locations\//, "");
    const j = (await gGet(
      `https://mybusiness.googleapis.com/v4/${account}/locations/${bare}/reviews?pageSize=1`,
    )) as { averageRating?: number; totalReviewCount?: number } | null;
    if (!j) return zero;
    return { rating: num(j.averageRating), reviews: num(j.totalReviewCount) };
  } catch {
    return zero;
  }
}

/** Per-client GMB performance. `locationId` = "locations/{id}". */
export async function getGmbPerf(
  locationId: string,
  range: ResolvedRange,
): Promise<GmbPerf | null> {
  try {
    const [cur, prev, review] = await Promise.all([
      windowMetrics(locationId, range.current),
      windowMetrics(locationId, range.previous),
      reviewSnapshot(locationId),
    ]);
    // No keys at all → not approved / no data yet → hide section.
    if (Object.keys(cur).length === 0 && Object.keys(prev).length === 0)
      return null;
    return { current: toSummary(cur, review), previous: toSummary(prev, review) };
  } catch {
    return null;
  }
}

export type GmbLocation = { id: string; title: string };

/** GMB locations the account manages (for the client-form dropdown). */
export async function listGmbLocations(): Promise<GmbLocation[]> {
  try {
    const accounts = (await gGet(`${ACCTS}/accounts?pageSize=20`)) as {
      accounts?: { name?: string }[];
    } | null;
    const account = accounts?.accounts?.[0]?.name;
    if (!account) return [];
    const j = (await gGet(
      `${INFO}/${account}/locations?readMask=name,title&pageSize=100`,
    )) as { locations?: { name?: string; title?: string }[] } | null;
    return (j?.locations ?? [])
      .filter((l) => l.name)
      .map((l) => ({ id: l.name!, title: l.title || l.name! }))
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}
