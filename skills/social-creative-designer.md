# Skill: Social Creative Designer

## Deskripsi
Membuat desain visual untuk konten sosial media menggunakan kode (SVG/HTML/CSS) atau koneksi MCP ke image generation API.

## Kapan Digunakan
- Membuat desain feed Instagram (single/carousel)
- Membuat visual untuk Instagram Stories
- Membuat thumbnail TikTok
- Membuat banner ads
- Membuat visual promo/offering

## Metode Pembuatan

### Metode 1: Code-Based (SVG/HTML/CSS)
Untuk desain yang bisa dikodekan:
- Carousel infografis
- Quote cards
- Promo banners dengan teks
- Data visualization untuk social media
- Template-based designs

### Metode 2: MCP Image Generation
Untuk desain yang butuh visual/fotografi:
- Mood board kampanye
- Social media creative dengan gambar
- Visual storytelling
- Ad creative mockup

#### MCP Setup untuk Image Generation:
```json
{
  "mcpServers": {
    "image-generator": {
      "type": "url",
      "url": "[URL_MCP_IMAGE_SERVICE]",
      "name": "image-gen"
    }
  }
}
```

**Catatan:** Sesuaikan URL MCP dengan layanan yang digunakan (contoh: Nano Banana untuk Gemini API, atau layanan lainnya). User perlu mengkonfigurasi API key sendiri.

## Format & Ukuran per Platform

### Instagram Feed
| Jenis | Ukuran | Rasio |
|-------|--------|-------|
| Square | 1080 × 1080 px | 1:1 |
| Portrait | 1080 × 1350 px | 4:5 |
| Landscape | 1080 × 566 px | 1.91:1 |

### Instagram Stories / Reels
| Jenis | Ukuran | Rasio |
|-------|--------|-------|
| Story | 1080 × 1920 px | 9:16 |
| Reels cover | 1080 × 1920 px | 9:16 |

### TikTok
| Jenis | Ukuran | Rasio |
|-------|--------|-------|
| Video | 1080 × 1920 px | 9:16 |
| Cover | 1080 × 1920 px | 9:16 |

### Ads
| Jenis | Ukuran | Rasio |
|-------|--------|-------|
| Feed Ad | 1080 × 1080 px | 1:1 |
| Story Ad | 1080 × 1920 px | 9:16 |
| Banner | 1200 × 628 px | 1.91:1 |

## Design Principles Mote Kreatif

### Typography
- Heading: Bold, besar, high contrast
- Body: Readable, clean
- CTA: Bold, contrasting color
- Max 3 font sizes per design

### Color Usage
- Primary brand color sebagai dominan
- Secondary untuk accent
- Putih/hitam untuk teks
- Konsisten dengan brand guideline klien

### Layout Rules
- Clean negative space
- Visual hierarchy yang jelas
- CTA di posisi prominent
- Logo placement konsisten
- Safe zone untuk crop di berbagai platform

### Content Types & Visual Style

#### Promo/Offering Post
- Headline besar (harga/diskon)
- Foto produk/layanan
- Badge urgency (Limited, Weekend Only, dll)
- CTA jelas

#### Testimonial Post
- Quote dari customer
- Rating stars
- Foto/avatar reviewer
- Brand watermark

#### Educational/Tips Post (Carousel)
- Cover slide eye-catching
- 1 poin per slide
- Icon/ilustrasi pendukung
- CTA slide terakhir

#### Behind the Scene
- Candid/authentic style
- Minimal text overlay
- Brand subtle presence

## Prompt Template untuk Image Generation

### Hotel & Resort:
```
Create a luxurious hotel promotional image: [deskripsi scene], 
Balinese resort aesthetic, lush tropical greenery, warm golden 
lighting, mountain backdrop, serene and elegant atmosphere.
Style: Professional hotel photography, warm color grading.
```

### F&B / Cafe:
```
Create a cozy cafe scene: [deskripsi], warm ambient lighting, 
rustic-modern interior, artisan coffee details, inviting atmosphere.
Style: Lifestyle photography, warm tones, shallow depth of field.
```

### Fashion:
```
Create a fashion flat lay / OOTD: [deskripsi items], clean minimal 
background, trendy styling, natural lighting.
Style: Fashion editorial, clean aesthetic.
```

## Output
- File SVG/HTML di `workspace/social-media/[klien]/visuals/`
- Naming: `[YYYY-MM-DD]_[platform]_[type]_[description].[ext]`
- Sertakan brief teks terpisah jika perlu di-design manual oleh tim
