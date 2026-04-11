# Carousel Desain — Liburan Sekolah Juli 2026
**Klien:** Rancabango Hotel & Resort
**Dibuat:** 11 April 2026 | Mote Kreatif

---

## File yang Tersedia

| File | Tema | Slides |
|---|---|---|
| `carousel-1.html` | **Paket Liburan Sekolah** — 3 pilihan paket + harga | Cover → Paket 2D1N → Weekend Plus → Extended 3D2N → CTA |
| `carousel-2.html` | **Fasilitas Keluarga** — 5 fasilitas unggulan | Cover → Kolam Renang → Kamar & View → Area Outdoor → CTA |
| `carousel-3.html` | **"Bali di Garut"** — 3 alasan memilih + testimonial | Cover → Jarak/Lokasi → Nuansa Bali → Value for Money → Testimoni & CTA |

---

## Cara Convert ke JPG/PNG (1080×1080px)

### Metode 1 — Chrome DevTools (Recommended, Manual)
1. Buka file `.html` di Chrome (zoom 100%)
2. Tekan `Cmd+Opt+I` → buka DevTools
3. Klik tab **Elements**
4. Pilih div `.slide` pertama → klik ikon `⋮` (3 titik) di panel Elements
5. Pilih **"Capture node screenshot"**
6. Ulangi untuk semua 5 slide per carousel
7. Simpan dengan nama: `carousel-1-slide-1.jpg` dst.

### Metode 2 — Puppeteer CLI (Otomatis, semua 15 slide sekaligus)
```bash
# Install (sekali saja)
npm install -g puppeteer

# Jalankan script ini dari folder nanobanana/
node convert.js
```

Script `convert.js` tersedia di bawah — buat file baru:
```javascript
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  for (let c = 1; c <= 3; c++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.goto(`file://${path.resolve(__dirname)}/carousel-${c}.html`);
    const slides = await page.$$('.slide');
    for (let s = 0; s < slides.length; s++) {
      await slides[s].screenshot({ path: `carousel-${c}-slide-${s+1}.jpg`, type: 'jpeg', quality: 95 });
      console.log(`✓ carousel-${c}-slide-${s+1}.jpg`);
    }
    await page.close();
  }
  await browser.close();
  console.log('Done! 15 slides generated.');
})();
```

### Metode 3 — macOS Screenshot
1. Buka di Safari
2. Zoom 100% (`Cmd+0`)
3. Gunakan `Cmd+Shift+4` → pilih area tepat 1080×1080px tiap slide

---

## Brand Colors Digunakan

| Nama | Hex | Penggunaan |
|---|---|---|
| Teal Dark | `#1A3F4A` | Background utama, header |
| Teal | `#3D7A8A` | Aksen, icon, elemen brand |
| Gold | `#C4A35A` | Ornamen, harga, aksen premium |
| Gold Light | `#E2C88A` | Highlight, gradient |
| Cream | `#F8F4EC` | Background slide konten |
| White | `#FFFFFF` | Teks di atas gelap |

## Font
- **Playfair Display** — heading, harga, nama paket (serif elegan)
- **Poppins** — body, list, caption (sans modern)

---

## Catatan Desainer
- Ukuran: 1080×1080px (rasio 1:1, optimal untuk IG Feed)
- Safe zone: 80px dari semua sisi untuk text penting
- CTA selalu di slide ke-5 dengan nomor WhatsApp: +62 896-6215-8784
- Logo placeholder pakai shape geometris — ganti dengan logo Rancabango aktual sebelum publish
- Harga pada Carousel 1 adalah **placeholder** — konfirmasi dengan klien sebelum publish
