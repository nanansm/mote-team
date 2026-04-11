# 🚀 Mote Kreatif — AI Marketing Team

## Quick Start Guide

### Apa ini?
Ini adalah sistem **AI Marketing Team** untuk Moté Kreatif, creative digital agency di Garut. Sistem ini mengubah Claude Code menjadi tim pemasaran AI lengkap yang bisa melakukan riset, menulis konten, menganalisis data, mendesain, dan merencanakan kampanye secara kolaboratif.

### Cara Menggunakan

#### 1. Buka Proyek di VS Code + Claude Code
```bash
cd mote-ai-marketing-team
code .
# Buka Claude Code extension
```

#### 2. Claude akan membaca `CLAUDE.md` secara otomatis
File ini berisi semua instruksi, routing rules, dan konteks yang dibutuhkan.

#### 3. Mulai Berikan Perintah
```
# Contoh perintah:
/campaign Ramadan 2026 untuk Rancabango Hotel
/report Rancabango Maret 2026
/content Instagram "Weekend Getaway" untuk Rancabango
/deck offering untuk klien baru cafe di Garut
/analyze data campaign Meta Ads bulan lalu
/task-check
```

---

## 📁 Struktur Folder

```
mote-ai-marketing-team/
│
├── CLAUDE.md                    ← Instruksi utama (wajib baca)
├── README.md                    ← File ini
│
├── context/                     ← Konteks & referensi
│   ├── brand/
│   │   └── brand-voice.md       ← Identitas & tone Mote Kreatif
│   ├── strategy/
│   │   └── marketing-strategy.md ← Framework & metrik marketing
│   └── clients/                 ← Brief per klien
│       ├── rancabango/brief.md
│       ├── gwesha/brief.md
│       └── persada/brief.md
│
├── sop/                         ← Standard Operating Procedures
│   ├── monthly-report-sop.md
│   ├── content-creation-sop.md
│   └── campaign-planning-sop.md
│
├── templates/                   ← Template referensi
│   ├── presentations/
│   │   └── proposal-template.md
│   ├── reports/
│   │   └── monthly-report-template.md
│   ├── social-media/
│   │   └── content-templates.md
│   └── landing-pages/
│       └── landing-page-template.md
│
├── skills/                      ← Keahlian spesifik
│   ├── branded-deck.md          ← Membuat proposal/presentasi
│   ├── social-content.md        ← Membuat konten sosmed
│   ├── marketing-analytics.md   ← Analisis data marketing
│   ├── landing-page-builder.md  ← Membuat landing page
│   ├── social-creative-designer.md ← Desain visual
│   └── campaign-strategy.md     ← Perencanaan kampanye
│
├── agents/                      ← Definisi sub-agen AI
│   ├── data-analyst.md          ← @data-analyst
│   ├── content-creator.md       ← @content-creator
│   ├── social-creative-designer.md ← @social-creative-designer
│   └── campaign-strategist.md   ← @campaign-strategist
│
├── workspace/                   ← Output hasil kerja
│   ├── ads/
│   ├── pages/
│   ├── presentations/
│   ├── reports/
│   ├── social-media/
│   └── campaigns/
│
├── integrations/                ← Koneksi tools eksternal
│   ├── notion/
│   │   └── taskbot-setup.md     ← Setup Notion task management
│   ├── mcp/
│   │   └── mcp-setup.md         ← Setup MCP connections
│   └── remote-control.md        ← Mobile access setup
│
└── tools/
    └── utilities.md             ← Naming conventions & utilities
```

---

## 🤖 Agen yang Tersedia

| Agen | Fokus | Perintah |
|------|-------|----------|
| **@campaign-strategist** | Riset, strategi, planning | `/campaign`, analisis kompetitor |
| **@content-creator** | Caption, blog, script, calendar | `/content`, `/calendar` |
| **@data-analyst** | Laporan, dashboard, analisis | `/report`, `/analyze` |
| **@social-creative-designer** | Visual, desain, gambar | `/design` |

---

## 🔗 Integrasi

### Notion (Task Management)
Setup di `integrations/notion/taskbot-setup.md`
- Scan & execute tasks otomatis
- Update status & attach output

### MCP (External Tools)
Setup di `integrations/mcp/mcp-setup.md`
- Image generation
- Google Drive access
- Web search untuk riset

### Remote Control (Mobile)
Setup di `integrations/remote-control.md`
- Kontrol dari HP via `/remote-control`

---

## 📋 Setup Checklist

- [ ] Install VS Code + Claude Code extension
- [ ] Buka folder project ini di VS Code
- [ ] (Opsional) Setup Notion MCP connection
- [ ] (Opsional) Setup Image Generation MCP
- [ ] (Opsional) Setup remote control
- [ ] Mulai dengan perintah pertama!

---

## 💡 Tips

1. **Mulai dari yang simpel** — Coba `/content Instagram "tips healing" untuk Rancabango` dulu
2. **Tambahkan data klien** — Semakin lengkap brief di `context/clients/`, semakin bagus hasilnya
3. **Gunakan Notion** — Task management via Notion bikin workflow lebih terstruktur
4. **Review & iterate** — Output AI adalah draft 90%, selalu review sebelum publish
5. **Update konteks** — Setelah setiap bulan, update data performa di brief klien

---

*Dibuat oleh Mote Kreatif × Claude AI — Hatur Nuhun! 🙏*
