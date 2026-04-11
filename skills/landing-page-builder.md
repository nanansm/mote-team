# Skill: Landing Page Builder

## Deskripsi
Membuat landing page untuk kampanye marketing klien menggunakan HTML/CSS/JS atau React.

## Kapan Digunakan
- Landing page kampanye spesifik
- Promo page untuk Meta Ads destination
- Micro-site untuk event
- Product showcase page

## Struktur Landing Page Standar

### 1. Hero Section
- Headline utama (tagline kampanye)
- Sub-headline (supporting message)
- CTA button (WhatsApp link / booking link)
- Background: Hero image atau video
- Mobile-first responsive

### 2. Trust Bar
- Rating Google Review
- Jumlah tamu/pelanggan
- Award/sertifikasi (jika ada)

### 3. Offering Section
- 3-4 card dengan benefit utama
- Icon + judul + deskripsi singkat
- Visual yang menarik

### 4. Gallery / Showcase
- Grid foto/video
- Swipeable carousel di mobile
- Caption singkat per item

### 5. Testimonial
- 2-3 review dari Google/sosmed
- Foto reviewer (jika tersedia)
- Rating stars

### 6. Promo / Special Offer
- Highlight promo aktif
- Harga normal vs harga promo
- Urgency element (limited time/slot)
- CTA button

### 7. FAQ
- 4-6 pertanyaan umum
- Accordion style

### 8. Contact / CTA Final
- WhatsApp link (dengan pre-filled message)
- Lokasi (Google Maps embed)
- Jam operasional
- Social media links

### 9. Footer
- Logo brand
- "Powered by Mote Kreatif" (opsional)
- Copyright

## Tech Stack
- HTML5 + Tailwind CSS (untuk simplicity)
- Atau React (untuk interaktivitas)
- Mobile-first design
- Fast loading (minimize external resources)
- WhatsApp API link: `https://wa.me/62xxx?text=Halo,%20saya%20tertarik%20dengan%20[promo]`

## Visual Guidelines per Industri

### Hotel & Resort
- Warna: Earth tones, biru langit, hijau alam
- Font: Serif untuk heading (elegan), Sans-serif untuk body
- Imagery: Landscape, kamar, pool, sunset
- Mood: Calm, luxurious, escape

### F&B / Cafe
- Warna: Warm tones (cokelat, krem, oranye)
- Font: Modern sans-serif
- Imagery: Close-up makanan/minuman, suasana cafe
- Mood: Cozy, welcoming, appetizing

### Fashion / Thrift
- Warna: Monochrome + accent color
- Font: Bold sans-serif
- Imagery: OOTD, flat lay, detail produk
- Mood: Trendy, affordable, stylish

## Output
- File HTML single-page di `workspace/pages/`
- Naming: `[YYYY-MM-DD]_landing-page_[campaign-name].html`
- Include meta tags untuk SEO dasar
- Include OpenGraph tags untuk social sharing

## Tracking Requirements
- Meta Pixel integration ready (placeholder)
- Google Analytics ready (placeholder)
- UTM parameter pada semua CTA links
- Event tracking pada button clicks
