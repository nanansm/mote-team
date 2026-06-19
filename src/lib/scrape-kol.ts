/**
 * KOL profile scraper — fills the pre-collab profile fields (followers + organic
 * ER) so the team doesn't hand-type them. Public-data only, routed through a
 * SOCKS5 proxy (Cloudflare WARP exit-IP) to dodge IG/TikTok IP-blocks.
 *
 * Scope (Profil KOL only — NOT campaign results):
 *   Instagram → followers + organic ER% (avg interaction of recent posts / followers)
 *   TikTok    → followers + proxy ER% (lifetime avg likes/video ÷ followers — recent
 *               per-video data needs a signed item_list request we can't make)
 *
 * Transport gotchas discovered live (don't "simplify" away):
 *   - IG's web_profile_info REJECTS HTTP/1.1 (429). MUST be HTTP/2 → undici
 *     allowH2 + manual tls.connect with ALPN ["h2","http/1.1"] over the SOCKS
 *     socket (undici's buildConnector drops ALPN when handed an httpSocket).
 *   - IG also enforces Sec-Fetch policy: without sec-fetch-* + Referer it 400s
 *     with "SecFetch Policy violation". Full browser-like header set required.
 *   - TikTok is the OPPOSITE: over HTTP/2 it serves an empty bot-shell (~11KB,
 *     no embedded JSON); over HTTP/1.1 it serves the full profile (~395KB). So
 *     transport is per-host: IG → h2, TikTok → h1.1 only. Profile HTML embeds
 *     stats only (no recent videos) → TikTok ER stays manual.
 *
 * Fragile by nature: IG/TikTok change markup/endpoints without notice. Every
 * function returns null on any failure — never throws, never blocks the form.
 * Hybrid UX: scraped values are editable, manual override wins.
 */
import tls from "node:tls";
import type { Socket } from "node:net";
import { Agent, buildConnector, fetch, type Dispatcher } from "undici";
import { SocksClient } from "socks";
import { env } from "./env";

const TIMEOUT_MS = 12_000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
// Public web app-id IG's own site sends; required by web_profile_info.
const IG_APP_ID = "936619743392459";

export type IgProfile = {
  username: string;
  fullName: string | null;
  followers: number;
  posts: number;
  /** organic ER % = avg(like+comment of recent posts) / followers * 100 */
  er: number | null;
  sampleSize: number; // posts used for ER
};

export type TiktokProfile = {
  username: string;
  nickname: string | null;
  followers: number;
  hearts: number;
  videos: number;
  /**
   * Proxy ER % = avg likes per video / followers * 100 = (hearts/videos)/followers.
   * NOTE: this is lifetime-cumulative (all-time likes ÷ all videos), likes-only —
   * NOT comparable apples-to-apples with IG's recent-12-posts ER (which includes
   * comments). Recent per-video TikTok engagement needs a signed item_list
   * request we can't do. Treat as a rough estimate; team can override.
   */
  er: number | null;
};

/** Parse "socks5h://host:port" (or socks5://) → SocksClient proxy config. */
function proxyConfig(): { host: string; port: number } | null {
  const raw = env.SCRAPE_PROXY_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return { host: u.hostname, port: Number(u.port) || 1080 };
  } catch {
    return null;
  }
}

/**
 * undici dispatcher that tunnels every connection through the WARP SOCKS5 proxy.
 * Transport is per-host (see file header): IG needs HTTP/2, TikTok needs
 * HTTP/1.1 — `http1Only` flips ALPN accordingly. Returns null if no proxy
 * configured — callers bail to manual entry rather than hit from the raw IP.
 */
function makeDispatcher(http1Only: boolean): Dispatcher | null {
  const proxy = proxyConfig();
  if (!proxy) return null;
  const alpn = http1Only ? ["http/1.1"] : ["h2", "http/1.1"];
  return new Agent({
    allowH2: !http1Only,
    connect: (opts: buildConnector.Options, cb: buildConnector.Callback) => {
      const hostname = String(opts.hostname);
      const isHttp = opts.protocol === "http:";
      const port = Number(opts.port) || (isHttp ? 80 : 443);
      SocksClient.createConnection({
        proxy: { host: proxy.host, port: proxy.port, type: 5 },
        command: "connect",
        destination: { host: hostname, port },
      })
        .then(({ socket }) => {
          if (isHttp) {
            cb(null, socket as unknown as Socket);
            return;
          }
          const t = tls.connect(
            {
              socket: socket as Socket,
              servername: hostname,
              ALPNProtocols: alpn,
            },
            () => cb(null, t as unknown as Socket),
          );
          t.on("error", (e) => cb(e, null));
        })
        .catch((e) => cb(e as Error, null));
    },
  }) as unknown as Dispatcher;
}

/** Extract the handle from a profile URL or raw "@handle" / "handle" string. */
export function parseHandle(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;
  const m = s.match(/(?:instagram|tiktok)\.com\/+@?([A-Za-z0-9._]+)/i);
  if (m) return m[1];
  const raw = s.replace(/^@/, "");
  return /^[A-Za-z0-9._]+$/.test(raw) ? raw : null;
}

/** Run fn, retrying up to `tries` times; returns first non-null result. */
async function retry<T>(
  tries: number,
  fn: () => Promise<T | null>,
): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fn();
      if (r != null) return r;
    } catch {
      /* swallow, retry */
    }
  }
  return null;
}

export async function scrapeInstagram(
  handleOrLink: string,
): Promise<IgProfile | null> {
  const handle = parseHandle(handleOrLink);
  if (!handle) return null;
  const dispatcher = makeDispatcher(false); // IG → HTTP/2
  if (!dispatcher) return null;

  return retry(3, async () => {
    const res = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`,
      {
        dispatcher,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent": UA,
          "x-ig-app-id": IG_APP_ID,
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "x-asbd-id": "129477",
          "x-ig-www-claim": "0",
          "x-requested-with": "XMLHttpRequest",
          Referer: "https://www.instagram.com/",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
        },
      },
    );
    if (res.status !== 200) return null;
    const u = ((await res.json()) as { data?: { user?: IgUser } })?.data?.user;
    if (!u) return null;

    const followers = u.edge_followed_by?.count ?? 0;
    const posts = u.edge_owner_to_timeline_media?.count ?? 0;
    const edges = u.edge_owner_to_timeline_media?.edges ?? [];

    let sum = 0;
    let n = 0;
    for (const e of edges) {
      sum +=
        (e.node?.edge_liked_by?.count ?? 0) +
        (e.node?.edge_media_to_comment?.count ?? 0);
      n += 1;
    }
    const er =
      n > 0 && followers > 0
        ? Math.round((sum / n / followers) * 100 * 100) / 100
        : null;

    return {
      username: u.username ?? handle,
      fullName: u.full_name || null,
      followers,
      posts,
      er,
      sampleSize: n,
    };
  });
}

export async function scrapeTiktok(
  handleOrLink: string,
): Promise<TiktokProfile | null> {
  const handle = parseHandle(handleOrLink);
  if (!handle) return null;
  const dispatcher = makeDispatcher(true); // TikTok → HTTP/1.1
  if (!dispatcher) return null;

  // TikTok's anti-bot LB intermittently serves an empty shell (no embedded JSON)
  // or times out even on HTTP/1.1 — retry until we get the real profile page.
  return retry(4, async () => {
    const res = await fetch(`https://www.tiktok.com/@${encodeURIComponent(handle)}`, {
      dispatcher,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": UA, Accept: "text/html" },
    });
    if (res.status !== 200) return null;
    const html = await res.text();
    const m = html.match(
      /__UNIVERSAL_DATA_FOR_REHYDRATION__"\s+type="application\/json">([\s\S]*?)<\/script>/,
    );
    if (!m) return null; // bot-shell, retry
    const scope = (JSON.parse(m[1]) as TiktokRehydration)?.["__DEFAULT_SCOPE__"];
    const info = scope?.["webapp.user-detail"]?.userInfo;
    if (!info) return null;
    const stats = info.statsV2 ?? info.stats ?? {};
    const user = info.user ?? {};
    const num = (v: unknown) => (v == null ? 0 : Number(v) || 0);
    const followers = num(stats.followerCount);
    const hearts = num(stats.heartCount ?? stats.heart);
    const videos = num(stats.videoCount);
    // Proxy ER from the only engagement signal the profile exposes (see type doc).
    const er =
      videos > 0 && followers > 0
        ? Math.round((hearts / videos / followers) * 100 * 100) / 100
        : null;
    return {
      username: user.uniqueId ?? handle,
      nickname: user.nickname || null,
      followers,
      hearts,
      videos,
      er,
    };
  });
}

// --- response shapes (partial; only fields we read) ---
type IgCount = { count?: number };
type IgUser = {
  username?: string;
  full_name?: string;
  edge_followed_by?: IgCount;
  edge_owner_to_timeline_media?: {
    count?: number;
    edges?: Array<{
      node?: { edge_liked_by?: IgCount; edge_media_to_comment?: IgCount };
    }>;
  };
};
type TiktokStats = {
  followerCount?: number | string;
  heartCount?: number | string;
  heart?: number | string;
  videoCount?: number | string;
};
type TiktokRehydration = {
  __DEFAULT_SCOPE__?: {
    "webapp.user-detail"?: {
      userInfo?: {
        statsV2?: TiktokStats;
        stats?: TiktokStats;
        user?: { uniqueId?: string; nickname?: string };
      };
    };
  };
};
