# Integrasi Notion — Task Management Bot

## Deskripsi
Menghubungkan tim AI Mote Kreatif dengan Notion sebagai task management system. Agen AI dapat membaca tugas yang pending, mengeksekusinya, dan memperbarui statusnya secara otomatis.

## Setup MCP Notion

### Konfigurasi di `.claude/settings.json` atau project settings:
```json
{
  "mcpServers": {
    "notion": {
      "type": "url",
      "url": "https://mcp.notion.com/mcp",
      "name": "notion-mcp"
    }
  }
}
```

### Catatan:
- User perlu mengotorisasi Notion MCP melalui Claude Code
- Pastikan workspace Notion sudah terhubung
- Database tugas harus sudah ada di Notion

## Struktur Database Notion (Task Board)

### Properties yang Diperlukan:
| Property | Type | Deskripsi |
|----------|------|-----------|
| Task Name | Title | Nama tugas |
| Status | Select | To-Do / In Progress / Review / Complete |
| Priority | Select | High / Medium / Low |
| Agent | Select | data-analyst / content-creator / designer / strategist |
| Client | Select | Rancabango / Gwesha / Persada / Internal |
| Due Date | Date | Deadline tugas |
| Description | Rich Text | Detail tugas |
| Output Link | URL | Link ke hasil kerja |
| Notes | Rich Text | Catatan tambahan dari agen |

### Status Flow:
```
To-Do → In Progress → Review → Complete
```

## Perintah Task Bot

### `/task-check` — Scan & Execute Tasks
Saat perintah ini dijalankan, agen akan:

1. **Scan** — Baca semua tugas dengan status "To-Do"
2. **Prioritize** — Urutkan berdasarkan priority (High → Medium → Low) dan due date
3. **Route** — Tentukan agen yang tepat berdasarkan field "Agent" atau konteks tugas
4. **Execute** — Kerjakan tugas sesuai skill yang dimiliki
5. **Update** — Ubah status menjadi "Complete" dan sertakan output link

### Contoh Alur:
```
User: /task-check

Claude: 📋 Scanning Notion tasks...

Found 3 pending tasks:

1. [HIGH] Rancabango — Buat laporan performa April 2026
   → Routing ke @data-analyst
   → Mengerjakan...
   → ✅ Complete — Output: workspace/reports/rancabango/2026-04_report.md

2. [HIGH] Gwesha — Content calendar Mei 2026
   → Routing ke @content-creator
   → Mengerjakan...
   → ✅ Complete — Output: workspace/social-media/gwesha/2026-05_calendar.md

3. [MEDIUM] Internal — Update company profile deck
   → Routing ke skill branded-deck
   → Mengerjakan...
   → ✅ Complete — Output: workspace/presentations/2026-04_compro-update.pptx
```

## Template Notion Database

### Untuk membuat database baru, gunakan query ini ke Notion MCP:
```
Buat database baru dengan nama "Mote AI Task Board" dengan properties:
- Task Name (title)
- Status (select: To-Do, In Progress, Review, Complete)
- Priority (select: High, Medium, Low)
- Agent (select: data-analyst, content-creator, designer, strategist, auto)
- Client (select: Rancabango, Gwesha, Persada, Internal)
- Due Date (date)
- Description (rich text)
- Output Link (url)
- Notes (rich text)
```

## Task Templates (Pre-filled Tasks)

### Weekly Recurring Tasks:
```
| Task | Agent | Client | Priority | Frequency |
|------|-------|--------|----------|-----------|
| Review social media metrics | data-analyst | All | Medium | Weekly |
| Plan next week content | content-creator | All | High | Weekly |
| Check Google Reviews | data-analyst | Rancabango | Medium | Weekly |
| KOL performance check | data-analyst | Rancabango | Medium | Weekly |
```

### Monthly Recurring Tasks:
```
| Task | Agent | Client | Priority | Frequency |
|------|-------|--------|----------|-----------|
| Monthly performance report | data-analyst | All | High | Monthly |
| Content calendar next month | content-creator | All | High | Monthly |
| Campaign strategy review | strategist | All | High | Monthly |
| Competitor analysis update | strategist | All | Medium | Monthly |
| KOL listing update | strategist | Rancabango | Medium | Monthly |
```

## Error Handling
- Jika Notion tidak terkoneksi: Tampilkan pesan setup instructions
- Jika task tidak punya cukup informasi: Set status "Review" dan tambah note
- Jika task gagal: Set status "Review" dengan error log di Notes
