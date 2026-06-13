# PRD — Mote Team

**Versi:** 1.0
**Tanggal:** 13 Juni 2026
**Pemilik:** Nanan Somanan (Mote Kreatif)
**Status:** Siap dikerjakan (Phase 1)

---

## 1. Ringkasan

**Mote Team** adalah aplikasi project management internal untuk agency **Mote Kreatif**, dibangun custom untuk menggantikan Notion. Tujuannya: melacak kinerja kerja internal lintas klien dan memastikan kebutuhan detail tiap klien terpenuhi lintas scope tim.

Aplikasi ini **internal only** — dipakai oleh Nanan dan tim Mote Kreatif. Klien **tidak** mengakses aplikasi ini.

**Repo:** `mote-team` (sudah ada di lokal). Remote GitHub: `nanansm/mote-team`.
**Nama produk:** Mote Team.
**Domain produksi (nanti):** `team.motekreatif.com`.

### Masalah yang diselesaikan
Notion saat ini kurang efisien untuk dua hal spesifik:
1. **Susah melihat overview lintas klien** — data tersebar per page/view, tidak ada satu layar untuk semua klien sekaligus.
2. **Rekap bulanan masih manual** — task completion / score per orang harus dihitung manual.

Plus pertimbangan biaya langganan Notion.

### Yang membuat aplikasi ini bernilai (killer features)
1. **Dashboard overview lintas klien** — satu layar: semua klien, task yang due, task yang stuck, progress pipeline per klien.
2. **Rollup otomatis** — task completion % per klien dan per periode, dihitung otomatis (computed via SQL, bukan disimpan).

Task management (Client → Task → status pipeline) adalah fondasi wajib agar dua fitur di atas berfungsi, bukan nilai jual utama.

---

## 2. Pengguna & Peran

- **Internal only.** Hanya anggota tim Mote Kreatif.
- Akses dibatasi via **allowlist email** (env `ALLOWED_EMAILS`, comma-separated). Email di luar allowlist ditolak login.
- Peran (role) disimpan di data, tapi **kontrol akses berbasis peran yang detail ditunda ke v2.** Di v1 semua user terautentikasi punya akses penuh.
- Konteks peran nyata: ada Director (yang assign & memantau) dan Staf (yang mengerjakan). Director meng-assign task ke staf, melihat progress lintas klien.

---

## 3. Tech Stack (TERKUNCI — jangan diganti)

- **Framework:** Next.js 15 (App Router)
- **Bahasa:** TypeScript (strict)
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL 16 — gunakan database `mote-db` yang sudah ada, dengan **schema baru `moteteam`** (konsisten dengan pola schema-per-produk: klir, capture, genvid, dll)
- **Auth:** better-auth + Google OAuth
- **CSS:** Tailwind v4
- **Komponen:** shadcn/ui
- **TANPA Redis / BullMQ / Worker** — aplikasi ini tidak punya job background, antrian, atau worker. Jangan tambahkan.

**Catatan penting:** karena tanpa BullMQ, `instrumentationHook` untuk worker tidak diperlukan. Tetap verifikasi API instrumentation Next.js 15 yang benar via Context7 sebelum implementasi — jangan berasumsi.

---

## 4. Infrastruktur & Deploy

- **Server:** Easypanel di `168.110.218.63` (Docker Swarm + Traefik).
- **Cara deploy:** buat **service baru di Easypanel dari GitHub repo** `nanansm/mote-team`. JANGAN docker compose mentah via SSH.
- **Port internal aman:** `3005` (belum terpakai; konfirmasi saat setup).
- **Domain:** custom domain Cloudflare `team.motekreatif.com` — WAJIB custom domain, jangan pakai default Easypanel.
- **Auto-deploy:** TIDAK diaktifkan. Deploy di-trigger manual setelah push manual.
- **Migrasi DB di produksi:** produksi tidak punya tracking `drizzle.__drizzle_migrations` yang andal — siapkan kemungkinan **migrasi di-apply manual via psql** saat deploy. Selalu backup sebelum perubahan schema besar.

---

## 5. Aturan Engineering Wajib

### 5.1 Anti-stuck (WAJIB — app di Easypanel berpotensi stuck setelah idle)
- **Singleton DB pool** — satu instance global, jangan buat pool baru tiap request.
- **`output: 'standalone'`** di `next.config.ts`.
- **Endpoint `/api/health`** untuk health check.
- **`instrumentation.ts`**: global error handler (`process.on('uncaughtException')` + `process.on('unhandledRejection')`) + self-ping ke `/api/health` setiap 45 detik.
- Monitoring eksternal pakai UptimeRobot (di luar scope kode).

### 5.2 Konfigurasi
- Semua konfigurasi dari `process.env`. **JANGAN hardcode** kredensial, URL, atau secret.
- API key / secret sensitif: jika perlu disimpan di DB, gunakan AES-256-GCM (di luar scope v1; v1 cukup env).

### 5.3 Database
- Schema **hanya TAMBAH (additive)**. Jangan pernah modify atau drop kolom/tabel yang sudah ada.
- Jangan hapus data tanpa konfirmasi eksplisit. Semua aksi delete di UI wajib pakai dialog konfirmasi.

### 5.4 Keamanan
- Semua route aplikasi di-protect (wajib login).
- Allowlist email via `ALLOWED_EMAILS`.

---

## 6. Data Model

Schema: `moteteam`. Semua tabel additive. Keputusan kunci: **1 task = 1 klien** (foreign key biasa, bukan junction). Assignee bisa lebih dari satu (junction table).

### 6.1 `client`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| name | text | nama klien |
| status | enum | `active` \| `on_hold` \| `offboarding` |
| contract_end | date nullable | |
| logo_url | text nullable | |
| created_at, updated_at | timestamp | |

### 6.2 `team_member`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| auth_user_id | text/uuid | relasi ke user better-auth |
| name | text | |
| role | text | mis. Director, Staf, Designer |
| grade | text nullable | grade gaji internal (opsional) |
| created_at, updated_at | timestamp | |

### 6.3 `task` (inti)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| title | text | |
| status | enum | `not_started` \| `in_progress` \| `done` \| `ready` \| `scheduled` \| `published` |
| client_id | uuid FK → client | **1 task = 1 klien** |
| parent_id | uuid FK → task (self), nullable | untuk sub-task |
| due_date | date nullable | |
| posting_date | date nullable | tanggal posting konten |
| type_content | enum nullable | `carousel` \| `reels` |
| caption | text nullable | |
| link_materi | text nullable | |
| link_output | text nullable | |
| link_ig | text nullable | |
| link_tiktok | text nullable | |
| media_url | text nullable | |
| monthly_performance_id | uuid FK → monthly_performance, nullable | |
| created_by | uuid FK → team_member | |
| created_at, updated_at | timestamp | |

### 6.4 `task_assignee` (junction — task ↔ assignee, many-to-many)
| Kolom | Tipe |
|---|---|
| task_id | uuid FK → task |
| team_member_id | uuid FK → team_member |
| PK gabungan (task_id, team_member_id) | |

### 6.5 `okr` (tabel didefinisikan; UI ditunda ke v2)
| Kolom | Tipe |
|---|---|
| id | uuid PK |
| objective | text |
| key_result | text |
| target | numeric |
| progress | numeric |
| period | text (mis. `2026-04`) |
| team_member_id | uuid FK → team_member |
| created_at, updated_at | timestamp |

### 6.6 `monthly_performance` (tabel didefinisikan; UI ditunda ke v2)
| Kolom | Tipe |
|---|---|
| id | uuid PK |
| month | text (mis. `2026-04`) |
| team_member_id | uuid FK → team_member |
| score_initiative | numeric nullable |
| created_at, updated_at | timestamp |

### 6.7 Relasi & Rollup
| Relasi | Tipe | Implementasi |
|---|---|---|
| Client → Task | 1 : banyak | FK `client_id` |
| Task ↔ Assignee | banyak : banyak | `task_assignee` |
| Task → Parent/Sub | self-relation | `parent_id` |
| Monthly Perf → Task | 1 : banyak | FK `monthly_performance_id` |

| Rollup | Cara hitung |
|---|---|
| Task completion % per klien | `COUNT(status IN done/published) / COUNT(*)` task milik klien — **computed via SQL saat query**, jangan disimpan |
| Task completion % per periode | rata-rata berdasarkan `monthly_performance_id` (v2/v3) |

Prinsip: rollup **dihitung saat query (computed), tidak disimpan di DB**, supaya angka selalu akurat.

---

## 7. Fitur per Fase

Pengerjaan **bertahap**. Selesaikan & test satu fase sebelum lanjut. Jangan kerjakan fase berikutnya lebih awal.

### Phase 1 — Foundation + Client CRUD
- Scaffold Next.js 15 App Router + TS strict.
- Setup Drizzle + schema `moteteam`, definisikan **SEMUA** tabel (bagian 6) + generate migration.
- Auth: better-auth + Google OAuth + allowlist email. Semua route di-protect.
- Anti-stuck lengkap (bagian 5.1).
- UI shell gaya Baserow (bagian 8): sidebar (Dashboard, Clients, Tasks), top bar, area konten grid.
- **Vertical slice:** Client CRUD — list grid (kolom: Name, Status, Contract End) + create/edit/delete (delete pakai konfirmasi).

**Acceptance:** `typecheck` & `build` pass; `dev` jalan; login Google + allowlist bekerja; Client CRUD bekerja; Playwright test halaman Clients render & responsive.

### Phase 2 — Task + Pipeline + Sub-task + Assignee
- Task CRUD penuh dengan semua field (bagian 6.3).
- Status pipeline: `not_started → in_progress → done → ready → scheduled → published` (UI ubah status mudah, mis. dropdown/drag).
- Sub-task (parent-child via `parent_id`) — tampilkan hierarki.
- Assign task ke satu/lebih anggota tim (`task_assignee`).
- Filter task per klien, per status, per assignee.
- View daftar task gaya grid Baserow.

**Acceptance:** CRUD task + sub-task + assignee bekerja; filter bekerja; `typecheck`/`build` pass; Playwright responsive.

### Phase 3 — Dashboard lintas klien + Rollup
- **Dashboard overview lintas klien:** satu layar — daftar semua klien dengan task completion % (rollup), jumlah task per status, task due minggu ini, task stuck (mis. lama tidak update / lewat due date).
- Rollup completion per klien (computed SQL).
- Ringkasan ringan: total task aktif, breakdown per status.

**Acceptance:** dashboard menampilkan data lintas klien akurat; rollup cocok dengan data; `typecheck`/`build` pass; Playwright responsive.

---

## 8. Spesifikasi UI / Desain

**Gaya: seperti Baserow.** Bersih, terang, padat (data-grid oriented).

- **Layout:** sidebar kiri (navigasi: Dashboard, Clients, Tasks) + top bar + area konten utama.
- **Tema:** terang (light), background putih/abu sangat muda, border halus, sudut `rounded-md`.
- **Aksen:** biru sebagai warna primary (gaya Baserow). *Opsional:* bisa diganti ke warna brand Mote Kreatif (kuning `#F5E642` + hijau tua `#1a3a2a`) nanti — tapi default v1 ikut Baserow (biru).
- **Tabel/grid:** padat, mudah dibaca, mirip spreadsheet — ini inti pengalaman Baserow.
- **Font:** **Plus Jakarta Sans**. JANGAN pakai Inter / Roboto / Arial.
- **JANGAN** pakai purple gradient atau layout yang terlalu padat/berantakan.
- Komponen pakai shadcn/ui, konsisten.

---

## 9. Aturan Kerja untuk Claude Code

### Wajib
- **Kerjakan bertahap per fase.** Jangan lompat fase. Selesai → minta user test → lanjut.
- **JANGAN push ke GitHub** kecuali user konfirmasi eksplisit "siap push". Berhenti di lokal.
- **JANGAN ubah file di luar repo `mote-team`.**
- **Lapor error dulu** sebelum coba fix sendiri, jika menemui error yang tidak trivial.
- **Catat scope lock tiap fase:** jangan kerjakan UI fase berikutnya lebih awal (tabel boleh didefinisikan semua di Phase 1, tapi UI Task/OKR/Monthly/Dashboard hanya di fasenya).

### Skills & MCP
- Panggil skill relevan dari `~/.skills/` (design → UI gaya Baserow; dev patterns → struktur Next.js + singleton + pola Easypanel).
- **Context7:** tarik docs terkini untuk Next.js 15 (App Router, instrumentation), better-auth (Google OAuth), Drizzle (PG schema + migration), Tailwind v4. Verifikasi API, jangan halu.
- **GitHub MCP:** hanya dipakai saat user sudah konfirmasi push.
- **Playwright:** test responsive (mobile + desktop) sebelum lapor selesai tiap fase.

### Quality gate tiap fase (sebelum lapor selesai)
1. `npm run typecheck` PASS
2. `npm run build` PASS
3. `npm run dev` jalan & fitur fase tsb berfungsi
4. Playwright responsive test pass
5. Lapor hasil + screenshot. TANPA push (kecuali diminta).

---

## 10. Di Luar Scope v1 (ditunda ke v2)

- OKR scoring penuh (input & tracking progress OKR di UI).
- Monthly Performance score otomatis (OKR avg + task completion + score initiative → total score).
- Kontrol akses berbasis peran yang detail (Director vs Staf permission).
- View Kanban & Calendar.
- Notifikasi / reminder.
- Integrasi metrik campaign eksternal (Meta/IG/TikTok) — report campaign klien TETAP dibuat terpisah di Canva, BUKAN bagian aplikasi ini.

---

## 11. Asumsi & Keputusan yang Dikunci

1. **1 task = 1 klien** (FK biasa). Jika berubah jadi multi-klien, perlu junction `task_client` — konfirmasi sebelum berubah.
2. Assignee bisa lebih dari satu per task (junction `task_assignee`).
3. Rollup computed (tidak disimpan).
4. Schema `moteteam` di database `mote-db` yang sudah ada.
5. Tanpa Redis/BullMQ.
6. Report campaign klien (Canva) di luar scope aplikasi ini.

---

## 12. Definisi Selesai (v1)

Aplikasi dianggap selesai v1 ketika:
- Tim bisa login (allowlist), kelola Client & Task dengan pipeline status & sub-task & assignee.
- Dashboard menampilkan overview lintas klien + rollup completion % yang akurat.
- Ter-deploy di `team.motekreatif.com` via Easypanel, stabil (tidak stuck setelah idle).
