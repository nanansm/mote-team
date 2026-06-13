# Mote Team

Project management web app internal **Mote Kreatif** — pengganti Notion. Internal only (allowlist email), klien tidak akses.

## Stack
Next.js 15 (App Router) · TypeScript · Drizzle ORM · PostgreSQL (schema `moteteam`) · better-auth + Google OAuth · Tailwind v4 · shadcn/ui.

## Setup lokal
```bash
cp .env.example .env      # isi DATABASE_URL, Google OAuth, BETTER_AUTH_SECRET, ALLOWED_EMAILS
npm install
npm run db:migrate        # apply schema ke moteteam (butuh DATABASE_URL)
npm run dev               # http://localhost:3005
```

## Scripts
| Script | Fungsi |
|---|---|
| `npm run dev` | Dev server (port 3005) |
| `npm run build` | Production build (standalone) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate migration dari schema |
| `npm run db:migrate` | Apply migration |

## Dokumen
- `PRD-mote-team.md` — product requirement + fase.
- `NOTION-AUDIT.md` — studi sistem Notion existing.
- `CLAUDE.md` — instruksi & status untuk AI assistant.

## Deploy
Easypanel (`168.110.218.63`) dari repo GitHub, custom domain `team.motekreatif.com`, port internal 3005. Auto-deploy off (manual). Detail: PRD §4.

## Status
Phase 1 selesai (foundation + auth + Client CRUD). Phase 2 (Tasks) & Phase 3 (Dashboard) belum.
