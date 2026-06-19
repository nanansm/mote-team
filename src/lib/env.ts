/**
 * Central env access. Non-throwing at import so `next build` succeeds without
 * secrets; runtime features fail loudly only when actually exercised.
 */
export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3005",
  // Extra allowed origins (comma-separated), e.g. LAN IP for phone testing.
  EXTRA_ORIGINS: process.env.EXTRA_ORIGINS ?? "",
  // Bootstrap admins: these emails may self-register and get the admin role.
  // Everyone else must be invited.
  ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? "",

  // Cloudflare R2 (object storage). Leave empty for local mock mode
  // (files saved to public/uploads, served at /uploads/...).
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ?? "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ?? "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ?? "",
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ?? "",
  R2_ENDPOINT: process.env.R2_ENDPOINT ?? "",
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ?? "",

  // Windsor.ai REST API key (organic/ads performance per client).
  WINDSOR_API_KEY: process.env.WINDSOR_API_KEY ?? "",

  // SOCKS5 proxy for KOL profile scraping (Cloudflare WARP exit-IP, dodges
  // IG/TikTok IP-block). Prod: socks5h://172.18.0.1:40000 (host gateway from
  // container). Local dev: SSH tunnel -L 40000:127.0.0.1:40000 then
  // socks5h://127.0.0.1:40000. Empty = direct (likely blocked, scrape returns null).
  SCRAPE_PROXY_URL: process.env.SCRAPE_PROXY_URL ?? "",

  // Meta (Facebook) Graph API access token for paid ads insights.
  META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ?? "",

  // SMTP for email notifications (task assignment + deadline reminders).
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: process.env.SMTP_PORT ?? "587",
  SMTP_SECURE: process.env.SMTP_SECURE ?? "false",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ?? "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME ?? "Mote Team",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL ?? "",

  // Evolution API (self-hosted WhatsApp gateway). Defaults overridable in
  // Settings (app_setting) — see lib/config getWaConfig.
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL ?? "",
  EVOLUTION_INSTANCE: process.env.EVOLUTION_INSTANCE ?? "",
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ?? "",

  // Shared secret guarding the cron reminder endpoint.
  CRON_SECRET: process.env.CRON_SECRET ?? "",

  APP_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3005",
};
