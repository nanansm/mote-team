# CLAUDE.md — Mote Team

Project management web app internal **Mote Kreatif**, pengganti Notion. Spec lengkap di [`PRD-mote-team.md`](./PRD-mote-team.md). Hasil studi sistem Notion existing di [`NOTION-AUDIT.md`](./NOTION-AUDIT.md). Baca keduanya sebelum kerja.

## Stack
Next.js 15 (App Router) · TypeScript strict · Drizzle ORM · PostgreSQL 16 (schema `moteteam` di db `mote-db`) · better-auth **email/password** (BUKAN Google) · Tailwind v4 · shadcn/ui (style base-nova, pakai `@base-ui/react` — komponen pakai prop `render`, BUKAN `asChild`). **Tanpa Redis/BullMQ/worker.**

## Auth & akses (override PRD per Nanan)
- **Email/password** via better-auth. Tanpa Google OAuth.
- **Invite-only signup**: admin bikin undangan di `/team` → link `/accept-invite?token=…` (share manual; SMTP/Resend belum). Bootstrap admin: `ADMIN_EMAILS` env + `npm run seed:admin`.
- Role `admin`/`member` di `user` (better-auth additionalFields). Admin gate: `requireAdmin()`. Menu Team admin-only.
- UI **Notion-style** (netral hangat + aksen hijau brand `#1a3a2a`), bukan Baserow biru. Logo Mote di `public/brand/` (komponen `LogoMark`/`Wordmark`, `next/image` `unoptimized`).
- Middleware matcher WAJIB exclude static (`.*\..*`) — kalau tidak, `/brand/*.png` ke-redirect 307.

## Aturan kerja (PRD §9)
- Kerjakan **bertahap per fase**. Selesai → user test → lanjut. Jangan lompat fase.
- **JANGAN push** ke GitHub tanpa konfirmasi eksplisit. Berhenti di lokal.
- Schema **additive only** — jangan modify/drop kolom existing.
- Semua delete di UI wajib dialog konfirmasi.
- Quality gate tiap fase: `npm run typecheck` · `npm run build` · `npm run lint` · `npm run dev` jalan · Playwright responsive.

## Perintah
- `npm run dev` — dev di port 3005
- `npm run typecheck` / `lint` / `build`
- `npm run db:generate` — generate migration dari schema (offline)
- `npm run db:migrate` / `db:push` — butuh `DATABASE_URL`

## Struktur
- `src/db/schema/` — `_base.ts` (pgSchema moteteam), `auth.ts` (better-auth), `app.ts` (client/task/team/okr/monthly_performance). `index.ts` re-export.
- `src/db/index.ts` — singleton postgres pool (anti-stuck PRD §5.1).
- `src/lib/` — `auth.ts` (better-auth server), `auth-client.ts`, `session.ts` (`requireSession` = cookie+DB+allowlist), `allowed-emails.ts` (fail-closed), `env.ts`, `types.ts`.
- `src/app/(app)/` — route group ter-protect (layout cek session). `dashboard/`, `clients/`, `tasks/`.
- `src/app/sign-in/` — public, Google login.
- `instrumentation.ts` — global error handler + self-ping /api/health tiap 45s.
- `src/middleware.ts` — optimistic cookie gate (full check di layout).

## Deviasi dari PRD (tercatat)
- `create-next-app` kasih Next 16 → di-pin ke Next 15 (PRD lock).
- `team_member` ditambah kolom `division` (performance/creative) + `active` — match Notion Team Directory, additive (PRD §5.3 izinkan).

## Ports (hindari bentrok local & Easypanel)
- Web app: **3005** (dev `next dev -p 3005` + prod internal). Easypanel expose via Traefik ke `team.motekreatif.com`.
- Dev DB: **5433** (Docker `docker-compose.yml`, host 5433 → container 5432). Prod pakai mote-db Easypanel (jaringan internal mereka), compose TIDAK dideploy.

## Local dev
```bash
docker compose up -d            # Postgres dev di :5433
cp .env.example .env            # DATABASE_URL=postgresql://mote:mote@127.0.0.1:5433/mote-db
npm run db:migrate
SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npm run seed:admin   # email harus ada di ADMIN_EMAILS
npm run dev
```

## Fitur tambahan (di luar PRD asli, per Nanan)
- **File upload (R2)**: `src/lib/r2.ts` — Cloudflare R2 via @aws-sdk/client-s3 + sharp. **Bucket privat** `mote-team` — file diserve lewat **proxy auth-gated `/api/r2/<key>`** (GetObject stream), TANPA public URL. **Mock mode** kalau R2 env kosong → `public/uploads`. Route `POST /api/upload` (auth, maks 10MB). Task form field Media (upload → thumbnail). Env `R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY/BUCKET_NAME/ENDPOINT` (PUBLIC_URL opsional). `npm run test:r2` cek koneksi. LIVE diuji (upload→R2→proxy 200).
- **Windsor performance** (LIVE): `src/lib/windsor.ts` — REST `connectors.windsor.ai`, **1 fetch per dataset** (semua akun, group by `account_name` di kode — param `accounts` Windsor tak reliabel), timeout 8s + cache 30m (anti-stuck). Menu **Performance** = report-style per klien: IG + TikTok, **Reach/Views/Engagement/ER%/New followers + MoM (30 hari vs 30 hari sebelumnya) + top 3 posts IG**. Mapping: `client.windsorAccountId` (IG account_name, mis. `rancabango_hotel`) + `client.windsorTiktokId` (TikTok account_name, mis. `RancabangoHotelResortGarut`) — set via form Clients. Env `WINDSOR_API_KEY`. **Gotcha:** field `follower_count_1d` cuma support 30 hari terakhir → JANGAN dipakai di query periode sebelumnya (400). Field IG: reach, views, total_interactions, followers_count(no-date), media_* untuk top posts. Field TikTok: unique_video_views(reach), video_views, likes/comments/shares, total_followers_count.

- **KOL profile scraper** (LIVE-tested): `src/lib/scrape-kol.ts` — auto-isi field Profil KOL (followers + organic ER) di form KOL biar gak input manual. Public-data only, route lewat **Cloudflare WARP SOCKS5 proxy** (`SCRAPE_PROXY_URL`, exit-IP Cloudflare → gak kena IP-block IG/TikTok). Tombol **"Scrape dari link"** di section Profil KOL → `POST /api/kol/scrape` (auth, IG+TikTok parallel) → autofill `igFollowers/igEr/tiktokFollowers/tiktokEr`, **field tetap editable (hybrid, manual override menang)**. **Gotcha transport (LIVE-found, jgn "disederhanakan"):** IG `web_profile_info` WAJIB **HTTP/2** (h1.1→429) + header `sec-fetch-*`+Referer (tanpa itu 400 "SecFetch Policy violation"); TikTok KEBALIKAN — **HTTP/1.1** (h2→bot-shell 11KB kosong), flaky → retry 4x. Pakai `undici` v6 (`allowH2`) + `socks` + manual `tls.connect` ALPN per-host (undici buildConnector buang ALPN kalau dikasih httpSocket). **ER:** IG organic ER = `avg(like+comment 12 post terakhir)/followers×100` (auto, recent akurat); **ER TikTok = proxy estimasi** `(total_hearts/jumlah_video)/followers×100` (lifetime avg likes/video — recent per-video butuh signed item_list yg gak bisa, jadi pakai stats akun yg ada; likes-only, beda makna dari ER IG, label "~ER"/estimasi, editable); Campaign ER (interaction/impressions) beda & gak di-scrape. Deps: `undici@^6` + `socks`. **Prod TODO:** set `SCRAPE_PROXY_URL=socks5h://172.18.0.1:40000` di Easypanel + verifikasi container mote-team bisa reach gateway warp-bridge (beda docker network → gateway mungkin beda dari 172.18.0.1). Tes LIVE @rindhyfos: IG 40169 foll/ER 0.95%, TikTok 5432 foll. Belum commit/deploy.

## Status (semua terverifikasi live via Docker PG + Playwright)
- **Phase 1 + 1.5**: foundation, anti-stuck, email/password auth, invite system, Client CRUD, UI Notion + logo.
- **Phase 2**: Task CRUD, pipeline status (inline), sub-task, multi-assignee, filter.
- **Phase 3**: dashboard lintas klien + rollup completion% (server-computed) + breakdown status + stat cards. Responsive (desktop + mobile 390px diuji).
- **R2 upload**: mock mode diuji (thumbnail + persist). Prod butuh isi `R2_*`.
- **Windsor**: scaffold + page graceful. Butuh `WINDSOR_API_KEY` + set `windsorAccountId` per klien untuk nyala.
- Prod deploy Easypanel BELUM. Belum commit (nunggu konfirmasi).

## Hardening / ops (react-doctor pass)
- **Timezone**: SEMUA date-logic lewat `src/lib/tz.ts` (WIB `Asia/Jakarta`). JANGAN `new Date().toISOString().slice(0,10)` atau `.getMonth()` buat "hari ini"/"bulan ini" — server UTC, geser 7 jam (00:00–07:00 WIB salah hari). Pakai `todayJakarta()`/`ymdOffset()`/`jakartaParts()`. `new Date()` buat `createdAt/updatedAt` (instant) tetap OK.
- **Error boundaries**: `(app)/error.tsx` + `(app)/loading.tsx` + `global-error.tsx`. 1 server-component throw = card recoverable, bukan layar putih.
- **Token at-rest encrypted**: `src/lib/crypto.ts` AES-256-GCM (key dari `BETTER_AUTH_SECRET`). `app_setting` key `windsor_api_key`/`meta_access_token` di-encrypt (marker `enc:v1:`). Plaintext lama auto-dibaca + ke-encrypt saat next save di Settings. `SECRET_SETTING_KEYS` di `config.ts`.
- **Windsor resilient**: `getAllOrganic` pakai `safe()` per-fetch → 1 connector mati (TikTok 400) tak blank seluruh panel.
- **Scaling**: dashboard rollup = SQL aggregate (`count filter`), bukan fetch-all-rows. Index di `task` (client/status/due_date/posting_date/parent) + `task_assignee.team_member_id` → migration `0006`.
- **Cron deadline reminder**: `GET /api/cron/reminders?secret=$CRON_SECRET` — TAK ada scheduler bawaan. Wajib daftar Easypanel Scheduled Task / cron eksternal harian (mis. tiap 07:00 WIB) waktu deploy, kalau tidak reminder diam-diam tak jalan. Butuh `CRON_SECRET` + SMTP.

## Bahasa
Default Bahasa Indonesia. Istilah teknis marketing/dev pakai Inggris yang umum.
