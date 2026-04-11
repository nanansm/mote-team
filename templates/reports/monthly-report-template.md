# Template Referensi: Monthly Marketing Report

## Catatan
Template ini berdasarkan format laporan aktual Rancabango Hotel Maret 2026.

## Struktur Standar (10 Slides)

### Slide 1: Cover
- "Marketing Report [Bulan] - [Tahun]"
- Logo klien (kanan atas)
- Deskripsi: "Berkas ini berisi paparan kronologis analisa, strategi, dan arahan marketing..."
- Footer: "Mote Kreatif untuk [Klien] © [Tahun]"
- Background: Brand color klien (contoh Rancabango: Teal #3D7A8A)

### Slide 2: Marketing Performance Dashboard
- Label: "Ringkasan"
- Filter Periode: [Bulan Tahun]
- Grid metrik:
  - **Profitability:** Real Omset, Marketing Spent, Cost as % of Revenue
  - **Brand Awareness:** Content Impression, Audience Reach
  - **Consideration:** Post Interaction, Engagement Rate, Audience Follow
  - **Action:** Click Links, CTR, Page View
  - **Purchase:** Add To Cart (OTA), Lead (WhatsApp)
- Setiap metrik: Angka + persentase perubahan (hijau↑ / merah↓)

### Slide 3: Executive Summary
- Label: "Marketing Profitability"
- Revenue total + Marketing Cost total + ratio
- 3 poin utama dalam numbered circles (1, 2, 3)

### Slide 4: Owned Media — Instagram
- Platform icon + follower count
- Grid: Total Post, Reach, Impression, Engagement, ER, Follower Growth
- Masing-masing dengan persentase MoM
- Key Insight paragraph
- Most Reached & Engaged post (mockup HP + metrics + takeaway)

### Slide 5: Owned Media — TikTok
- Sama seperti Instagram

### Slide 6: Paid Media — KOL
- Jika ada: metrics KOL campaign
- Jika tidak: "Tidak ada aktivasi KOL dibulan ini karena [alasan]"

### Slide 7: Paid Media — Meta Ads (Ringkasan)
- Leads count + growth
- Reach, Impression, Landing Page View, Spent, CPL
- Most Traffic post + Most Leads post
- Key Insight

### Slide 8: Google Review
- Screenshot positive reviews (3-4 reviews)
- Sentiment analysis

### Slide 9: Key Learning
- 3 kolom: Learning | Challenge | Strategy
- Masing-masing 3 poin numbered

### Slide 10: Closing
- Statement penutup (contoh: "Bulan [x] menjadi bukti [brand] telah...")
- Logo klien + logo Mote
- Background: foto brand + overlay

## Data Template (JSON format untuk dashboard)

```json
{
  "report_meta": {
    "client": "",
    "period": "",
    "prepared_by": "Mote Kreatif"
  },
  "profitability": {
    "real_omset": { "value": 0, "growth_pct": 0 },
    "marketing_spent": { "value": 0, "growth_pct": 0 },
    "cost_ratio": { "value": 0, "growth_pct": 0 }
  },
  "awareness": {
    "impression": { "value": 0, "growth_pct": 0 },
    "reach": { "value": 0, "growth_pct": 0 }
  },
  "consideration": {
    "interaction": { "value": 0, "growth_pct": 0 },
    "engagement_rate": { "value": 0, "growth_pct": 0 },
    "followers_new": { "value": 0, "growth_pct": 0 }
  },
  "action": {
    "clicks": { "value": 0, "growth_pct": 0 },
    "ctr": { "value": 0, "growth_pct": 0 },
    "page_views": { "value": 0, "growth_pct": 0 }
  },
  "purchase": {
    "add_to_cart": { "value": 0, "growth_pct": 0 },
    "leads": { "value": 0, "growth_pct": 0 }
  },
  "owned_media": {
    "instagram": {
      "followers": 0,
      "total_post": { "value": 0, "growth_pct": 0 },
      "reach": { "value": 0, "growth_pct": 0 },
      "impression": { "value": 0, "growth_pct": 0 },
      "engagement": { "value": 0, "growth_pct": 0 },
      "engagement_rate": { "value": 0, "growth_pct": 0 },
      "follower_growth": { "value": 0, "growth_pct": 0 },
      "top_post": {
        "impression": 0,
        "reach": 0,
        "engagement": 0,
        "takeaway": ""
      }
    },
    "tiktok": {
      "followers": 0,
      "total_post": { "value": 0, "growth_pct": 0 },
      "reach": { "value": 0, "growth_pct": 0 },
      "impression": { "value": 0, "growth_pct": 0 },
      "engagement": { "value": 0, "growth_pct": 0 },
      "engagement_rate": { "value": 0, "growth_pct": 0 },
      "follower_growth": { "value": 0, "growth_pct": 0 },
      "top_post": {
        "impression": 0,
        "reach": 0,
        "engagement": 0,
        "takeaway": ""
      }
    }
  },
  "paid_media": {
    "meta_ads": {
      "leads": { "value": 0, "growth_pct": 0 },
      "reach": { "value": 0, "growth_pct": 0 },
      "impression": { "value": 0, "growth_pct": 0 },
      "lpv": { "value": 0, "growth_pct": 0 },
      "spent": { "value": 0, "growth_pct": 0 },
      "cpl": { "value": 0, "growth_pct": 0 }
    },
    "kol": {
      "active": false,
      "note": ""
    }
  },
  "key_learning": {
    "learning": ["", "", ""],
    "challenge": ["", "", ""],
    "strategy": ["", "", ""]
  },
  "executive_summary": ["", "", ""],
  "closing_statement": ""
}
```
