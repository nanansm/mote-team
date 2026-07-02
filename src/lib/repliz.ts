import { getReplizAccessKey, getReplizSecret, isReplizEnabled } from "./config";
import type { DateWindow, ResolvedRange } from "./date-range";
import type { PlatformSummary, TiktokPerf, TopPost } from "./social-types";

/**
 * TikTok organic insight via Repliz API (direct — replaces Windsor). Repliz
 * already has the TikTok accounts connected (used for scheduling). HTTP Basic
 * auth, Gold plan. Per-video statistic, aggregated per window. 8s timeout +
 * 30 min cache. Absolute follower count is NOT exposed by Repliz → passed in
 * from the client's manual `tiktokFollowers` field.
 */
const BASE = "https://api.repliz.com/public";
const num = (v: unknown): number => Number(v) || 0;

export async function isReplizConfigured(): Promise<boolean> {
  const [on, ak, sk] = await Promise.all([
    isReplizEnabled(),
    getReplizAccessKey(),
    getReplizSecret(),
  ]);
  return on && Boolean(ak && sk);
}

async function authHeader(): Promise<string> {
  const [ak, sk] = await Promise.all([getReplizAccessKey(), getReplizSecret()]);
  if (!ak || !sk) throw new Error("Repliz creds belum di-set");
  return "Basic " + Buffer.from(`${ak}:${sk}`).toString("base64");
}

async function rGet(path: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: await authHeader() },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 1800 },
  });
  return res.json();
}

type ContentDoc = {
  id: string;
  createdAt?: string;
  description?: string;
  title?: string;
  url?: string;
  medias?: { thumbnail?: string }[];
};
type Stat = {
  like?: number;
  comment?: number;
  share?: number;
  reach?: number;
  views?: number;
  favourite?: number;
  newFollower?: number;
};

const inWindow = (createdAt: string | undefined, w: DateWindow) => {
  const d = (createdAt ?? "").slice(0, 10);
  return d >= w.from && d <= w.to;
};

/** Run async fn over items with limited concurrency. */
async function pool<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** List videos newer than `oldest` (YYYY-MM-DD), paginating Repliz content. */
async function listVideos(accountId: string, oldest: string): Promise<ContentDoc[]> {
  const all: ContentDoc[] = [];
  let next = "";
  for (let page = 0; page < 10; page++) {
    const q = `?accountId=${encodeURIComponent(accountId)}&type=media${
      next ? `&nextToken=${encodeURIComponent(next)}` : ""
    }`;
    const j = await rGet(`/content${q}`);
    if ((j as { code?: number }).code) break; // 402/404 etc → stop gracefully
    const docs = (j.docs as ContentDoc[] | undefined) ?? [];
    all.push(...docs);
    next = String((j.nextToken as string | undefined) ?? "");
    const oldestSeen = docs[docs.length - 1]?.createdAt?.slice(0, 10) ?? "";
    if (!next || !docs.length || oldestSeen < oldest) break;
  }
  return all;
}

function summary(stats: Stat[], followers: number): PlatformSummary {
  const reach = stats.reduce((s, x) => s + num(x.reach), 0);
  const views = stats.reduce((s, x) => s + num(x.views), 0);
  const engagement = stats.reduce(
    (s, x) => s + num(x.like) + num(x.comment) + num(x.share),
    0,
  );
  const newFollowers = stats.reduce((s, x) => s + num(x.newFollower), 0);
  return {
    reach,
    views,
    engagement,
    newFollowers,
    followers,
    er: reach > 0 ? Math.round((engagement / reach) * 1000) / 10 : 0,
  };
}

/**
 * Per-client TikTok performance. `replizAccountId` = Repliz account _id.
 * `manualFollowers` = client.tiktokFollowers (Repliz has no absolute count).
 */
export async function getTiktokPerf(
  replizAccountId: string,
  range: ResolvedRange,
  manualFollowers = 0,
): Promise<TiktokPerf | null> {
  try {
    const videos = await listVideos(replizAccountId, range.previous.from);
    const cur = videos.filter((v) => inWindow(v.createdAt, range.current));
    const prev = videos.filter((v) => inWindow(v.createdAt, range.previous));
    if (cur.length === 0 && prev.length === 0) return null;

    const stat = (id: string) =>
      rGet(`/content/${id}/statistic?accountId=${encodeURIComponent(replizAccountId)}`)
        .then((s) => (("code" in s ? {} : s) as Stat))
        .catch(() => ({} as Stat));

    const [curStats, prevStats] = await Promise.all([
      pool(cur, 5, (v) => stat(v.id)),
      pool(prev, 5, (v) => stat(v.id)),
    ]);

    const top: TopPost[] = cur
      .map((v, i) => {
        const s = curStats[i];
        return {
          permalink: String(v.url ?? ""),
          type: "video",
          engagement: num(s.like) + num(s.comment) + num(s.share),
          reach: num(s.reach),
          thumbnail: v.medias?.[0]?.thumbnail ?? null,
        };
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);

    return {
      current: summary(curStats, manualFollowers),
      previous: summary(prevStats, manualFollowers),
      top,
    };
  } catch {
    return null;
  }
}

export type ReplizAccount = { id: string; username: string };

/** TikTok accounts connected in Repliz (for the client-form dropdown). */
export async function listReplizTiktokAccounts(): Promise<ReplizAccount[]> {
  try {
    const out: ReplizAccount[] = [];
    for (let page = 1; page <= 5; page++) {
      const j = await rGet(`/account?page=${page}&limit=50&types=tiktok`);
      if ((j as { code?: number }).code) break;
      const docs = (j.docs as { id?: string; _id?: string; name?: string; username?: string }[] | undefined) ?? [];
      for (const d of docs) {
        const id = d.id ?? d._id;
        if (id) out.push({ id, username: d.username || d.name || id });
      }
      if (!(j as { hasNextPage?: boolean }).hasNextPage) break;
    }
    return out.sort((a, b) => a.username.localeCompare(b.username));
  } catch {
    return [];
  }
}
