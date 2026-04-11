# Tools & Utility Scripts

## Deskripsi
Kumpulan utility yang bisa digunakan oleh semua agen untuk tugas-tugas umum.

## 1. File Naming Convention

### Format: `[YYYY-MM-DD]_[tipe]_[deskripsi].[ext]`

| Tipe | Deskripsi |
|------|-----------|
| `report` | Laporan performa |
| `calendar` | Content calendar |
| `caption` | Kumpulan caption |
| `brief` | Campaign/creative brief |
| `deck` | Presentasi/proposal |
| `landing` | Landing page |
| `visual` | Desain visual |
| `analysis` | Analisis data |
| `dashboard` | Dashboard interaktif |

### Contoh:
```
2026-04-11_report_rancabango-maret.pdf
2026-04-11_calendar_gwesha-april.md
2026-04-11_deck_persada-offering.pptx
2026-04-11_landing_rancabango-lebaran.html
```

## 2. Quick Commands Reference

| Command | Deskripsi | Agen |
|---------|-----------|------|
| `/campaign [nama]` | Launch full campaign | @campaign-strategist |
| `/report [klien] [periode]` | Generate report | @data-analyst |
| `/content [platform] [topik]` | Create content | @content-creator |
| `/deck [jenis] [topik]` | Create presentation | skill: branded-deck |
| `/analyze [data]` | Analyze marketing data | @data-analyst |
| `/design [brief]` | Create visual design | @social-creative-designer |
| `/calendar [klien] [bulan]` | Create content calendar | @content-creator |
| `/task-check` | Check & execute Notion tasks | All agents |
| `/remote-control` | Enable mobile access | System |
| `/status` | Show all active projects | System |

## 3. Data Format Standards

### Currency: Indonesian Rupiah
```
Rp 1.000.000 (with dots as thousand separator)
Rp 15.000.000
Rp 721.367.354
```

### Percentage:
```
77% (no decimal for whole numbers)
3,02% (comma as decimal separator - Indonesian format)
0,44%
```

### Date:
```
11 April 2026 (for display)
2026-04-11 (for filenames)
April 2026 (for monthly periods)
Q1 2026 (for quarterly)
```

### Growth Indicators:
```
↑ 77%  atau  +77%  (hijau/positif)
↓ 50%  atau  -50%  (merah/negatif)
→ 0%   atau  ±0%   (netral)
```

## 4. Project Status Template

```markdown
# Status Proyek Mote Kreatif
## Update: [Tanggal]

### Klien Aktif

#### 🏨 Rancabango Hotel & Resort
- Status: [Active/On Track/Needs Attention]
- Current Phase: [Content Production/Campaign Active/Reporting]
- Pending Tasks: [jumlah]
- Next Milestone: [deskripsi + tanggal]

#### 👗 Gwesha.outfit
- Status: [Active/On Track/Needs Attention]
- Current Phase: [deskripsi]
- Pending Tasks: [jumlah]
- Next Milestone: [deskripsi + tanggal]

#### ☕ Persada Coffee Zone
- Status: [Active/On Track/Needs Attention]
- Current Phase: [deskripsi]
- Pending Tasks: [jumlah]
- Next Milestone: [deskripsi + tanggal]

### Tim AI Status
- @data-analyst: [idle/working on X]
- @content-creator: [idle/working on X]
- @social-creative-designer: [idle/working on X]
- @campaign-strategist: [idle/working on X]
```
