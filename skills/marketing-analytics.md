# Skill: Marketing Analytics & Dashboard

## Deskripsi
Menganalisis data marketing dan menghasilkan laporan performa, insight, dan dashboard interaktif.

## Kapan Digunakan
- Mengolah data kampanye (CSV/Excel)
- Membuat laporan performa bulanan
- Membuat dashboard interaktif
- Analisis ROI dan efektivitas channel
- Benchmarking dan trend analysis

## Metrik yang Dianalisis

### Profitability
| Metrik | Rumus | Target |
|--------|-------|--------|
| Marketing ROI | (Revenue - Marketing Cost) / Marketing Cost | >5x |
| Marketing Cost Ratio | Marketing Cost / Revenue × 100% | <10% |
| Cost Per Lead (CPL) | Total Ad Spent / Total Leads | Menurun MoM |
| Customer Acquisition Cost | Total Marketing Cost / New Customers | Menurun MoM |

### Brand Awareness
| Metrik | Sumber | Benchmark |
|--------|--------|-----------|
| Reach | IG/TikTok Insights | Growth >10% MoM |
| Impression | IG/TikTok Insights | Growth >10% MoM |
| Follower Growth | IG/TikTok Insights | Growth >5% MoM |
| Brand Mention | Manual tracking | Meningkat |

### Engagement
| Metrik | Rumus | Benchmark |
|--------|-------|-----------|
| Engagement Rate | (Likes + Comments + Shares + Saves) / Reach × 100% | >3% |
| Click Through Rate | Clicks / Impression × 100% | >1% |
| Video View Rate | Views / Impression × 100% | >30% |

### Conversion
| Metrik | Sumber | Benchmark |
|--------|--------|-----------|
| Landing Page View | Meta Ads Manager | Growth MoM |
| Lead Conversion Rate | Leads / LPV × 100% | >3% |
| Add to Cart (OTA) | OTA Platform | Growth MoM |

## Template Analisis

### Executive Summary Template:
```markdown
## Executive Summary — [Bulan] [Tahun]

### Performance Highlights
1. [Insight positif utama dengan angka]
2. [Insight kedua — channel/taktik yang berhasil]
3. [Tantangan utama dan implikasinya]

### Key Numbers
- Revenue: Rp [xxx] ([↑/↓]xx% vs bulan lalu)
- Marketing Spent: Rp [xxx] ([↑/↓]xx%)
- Marketing Cost Ratio: [x]%
- Leads: [xxx] ([↑/↓]xx%)
- CPL: Rp [xxx] ([↑/↓]xx%)
```

### Dashboard Data Structure (untuk HTML/React dashboard):
```json
{
  "period": "Maret 2026",
  "client": "Rancabango Hotel",
  "profitability": {
    "revenue": 721367354,
    "revenue_growth": 77,
    "marketing_spent": 3194564,
    "spent_growth": -75,
    "cost_ratio": 0.44,
    "ratio_growth": -86
  },
  "awareness": {
    "impression": 636447,
    "impression_growth": -81,
    "reach": 176341,
    "reach_growth": -91
  },
  "consideration": {
    "interaction": 1757,
    "interaction_growth": -77,
    "engagement_rate": 1.00,
    "er_growth": 147,
    "followers_new": 174,
    "followers_growth": -21
  },
  "action": {
    "clicks": 6493,
    "clicks_growth": -27,
    "ctr": 1.02,
    "ctr_growth": 287,
    "page_views": 8400,
    "pv_growth": -31
  },
  "purchase": {
    "add_to_cart": 949,
    "atc_growth": 8,
    "leads": 1800,
    "leads_growth": -58
  }
}
```

## Jenis Output

### 1. Quick Analysis (Text)
- Ringkasan 3-5 poin
- Rekomendasi 2-3 tindakan
- Format: Markdown

### 2. Full Report (Document)
- Sesuai SOP Monthly Report
- Format: PDF/PPTX
- Lihat `sop/monthly-report-sop.md`

### 3. Interactive Dashboard (HTML)
- Chart: Line chart untuk trend, Bar chart untuk perbandingan
- Filter: Per platform, per periode
- Color coding: Hijau (positif), Merah (negatif)
- Library: Chart.js atau Recharts
- Simpan di `workspace/reports/`

## Proses Kerja
1. Terima data (CSV, Excel, atau manual input)
2. Bersihkan dan validasi data
3. Hitung semua metrik & perbandingan MoM
4. Generate insight otomatis berdasarkan pattern
5. Buat visualisasi yang sesuai
6. Tulis rekomendasi actionable
7. Simpan output di `workspace/reports/[klien]/`

## Insight Generation Rules
- Jika metrik naik >20%: "Pertumbuhan signifikan"
- Jika metrik naik >50%: "Lonjakan luar biasa"
- Jika metrik turun >20%: "Penurunan yang perlu perhatian"
- Jika metrik turun >50%: "Penurunan drastis, perlu tindakan segera"
- Selalu korelasikan dengan faktor eksternal (musim, event, budget change)
- Selalu berikan "so what" — implikasi bisnis dari setiap angka
