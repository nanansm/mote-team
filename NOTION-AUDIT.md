# Notion Audit — Mote Kreatif Project Management

Hasil studi workspace Notion Mote Kreatif (per 2026-06-13). Jadi dasar requirement web app pengganti.

## Ringkasan eksekutif

Notion Mote dipakai untuk **2 hal utama**: (1) produksi konten social media per klien dengan pipeline status, dan (2) performance management bulanan berbasis OKR + task completion. Sumber kebenaran = Notion; WhatsApp = corong reminder. Ada peran khusus "Task Traffic Controller" (Nadila) yang jaga semua task bergerak.

Web app pengganti minimal harus mereplikasi: **Master Task pipeline, Client Directory, Team Directory, OKR Tracker, Monthly Performance scoring**, plus alur reminder/eskalasi.

---

## Sistem inti (5 database saling-relasi)

### 1. Master Task (Task Management) — jantung operasional
Pipeline produksi konten. Tiap baris = 1 konten/task.

**Status** (urutan): `Not started → In Progress → Done → Ready → Scheduled → Published`
- Target akhir konten = **Published**, bukan berhenti di "Done".

**Fields:**
- `Task Name` (title) — konvensi: `KLIEN - PLATFORM - BULAN - [TIPE] Judul`
  - contoh: `RANCABANGO - TT - Juni - Bersantai di kursi Rancabango`
  - contoh: `GWESHA - Video Content IG & TT - April - TRY-ON #6`
- `Status` (status) · `Assigne` (person, bisa >1) · `Due Date` (date) · `Tanggal Posting` (date)
- `Client Directory` (relation → Client Directory)
- `Type Content` (select: Carousel, Reels)
- `Parent item` / `Sub-item` (self-relation, breakdown task)
- `Monthly Review` (relation → Monthly Performance)
- Links: `Link Materi`, `Link Output`, `Link Posting IG`, `Link Posting TT` (url)
- `Caption`, `Text` (text) · `Media`, `Voice Over` (file)
- `Done?` (formula) — dipakai rollup Task Completion
- Body page: Referensi (embed), Brief, Text/script

**View utama:** grouped by Client, filter by Assigne. Per-orang lihat task-nya.

### 2. Client Directory
- `Client Name` (title) · `Status` (Active / On hold / Offboarding) · `Contract End` (date) · `Logo` (file)
- relasi ke Master Task
- Klien aktif terdeteksi di data Juni 2026: **Rancabango, Gwesha, Persada, Restorasa, Sinarberkah** (CLAUDE.md sebut Restorasa "alumni" — data nyata tunjuk masih aktif; perlu konfirmasi).

### 3. Team Directory
- `Name` (title) · `Role` · `Division` (Performance Team / Creative Team) · `Active` (checkbox)
- `Parent item`/`Sub-item` (hierarki tim) · `Team`/`Monthly Review` (relation)
- **Roles:** KOL Strategist, Managing Director, Customer Relation Manager, Junior Content Creator, Video Editor, Graphic Designer, Social Media Admin, Content Creator, Content Writer
- **Anggota terdeteksi:** Shafira, Galih, Rangga, Fahmi, Fungky, Alexa, Ale, Nadilla, Hilmi (+ Nanan=Head Business, Ryan & Indriawan=Head)

### 4. OKR Tracker
KPI target vs aktual per klien per bulan.
- `Objective Name` (title) · `Select` (metrik: Followers Growth, Impression, Reach, Engagement, Engagement Rate, Click Links, Leads, Conversion Rate)
- `Target` (number) · `Current` (number) · `Achievment` (formula = Current/Target)
- `Target Role` (multi-select role yang bertanggung jawab) · `Client Directory` · `Monthly Review` (relation)

### 5. Monthly Performance (The Core System)
Scoring bulanan tim.
- `Periode Name` (title) · `Month` (date)
- `Task Completion` (rollup avg dari Done? di Master Task)
- `OKR Avg` (rollup dari OKR Tracker) · `Score Initiative` (number manual)
- `Total Score` (formula gabungan) · `Team` (relation), `OKR Tracker` (relation)

---

## Alur kerja (Workflow 5 langkah)
1. **Brief & Kickoff** — klien brief via WA grup → PM dokumentasikan ke Notion.
2. **Task Delegation** — PM breakdown task, assign PIC + deadline.
3. **Eksekusi, Feedback, Revisi** — produksi, update status, approval tracking (Frame.io video / Figma desain / Gdocs copy). Internal QC.
4. **Client Approval** — presentasi, feedback, revisi (maks 2-3x), final approval → arsip.
5. **Reporting** — post-mortem, deck laporan, feedback form klien.

## Struktur tim
- **Director:** Marketing Director, Creative Director
- **Management:** Project Manager
- **Execution:** Team Leader → Creative Production (Foto/Video, Desain Grafis), Social Media Strategist, Growth Strategist
- 2 divisi operasional: **Performance Team** & **Creative Team**

## Peran Task Controller (Nadila / "Traffic Controller")
- **Notion = sumber kebenaran. WA = corong reminder.** Status di Notion, bukan chat.
- Tiap task wajib: **1 Assignee · Due Date · Status terkini.**
- Ritme harian (Hybrid WFH Sen-Sel, WFO Rab-Jum): Senin buka minggu, Selasa cek due Rab-Kam, Rabu sync 15mnt, Kamis chase due, Jumat tutup minggu + rekap.
- **Eskalasi ke Nanan:** task macet >2 hari, penyebab seorang Head (Ryan/Indriawan), atau overload 1 orang.
- Beban ±30 mnt/hari.

---

## Implikasi untuk web app pengganti

**Wajib ada (MVP):**
- Task board produksi konten (kanban by Status + table grouped by Client + filter by Assignee)
- Client Directory, Team Directory dengan role & divisi
- Relasi task↔klien↔assignee, parent/sub-task
- Link fields (materi/output/posting IG/TT), brief & script di body
- Due Date + Tanggal Posting (calendar view)

**Fase 2 (yang bikin sistem ini "Core"):**
- OKR Tracker per klien/bulan + Achievement %
- Monthly Performance scoring (auto rollup Task Completion + OKR Avg + Score Initiative → Total Score)
- Dashboard controller: task macet, due hari ini, overload per orang, eskalasi
- Notifikasi/reminder (ganti corong WA manual)

**Pertimbangan integrasi:**
- Meta Ads token tersedia global (insights klien) → bisa auto-isi OKR metrik.
- Windsor MCP untuk organic (IG/TikTok/GMB).
