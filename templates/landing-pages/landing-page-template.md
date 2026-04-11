# Template: Landing Page

## Referensi HTML Skeleton

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Campaign Title] — [Brand Name]</title>
    <meta name="description" content="[Meta description 150-160 chars]">
    
    <!-- Open Graph -->
    <meta property="og:title" content="[Campaign Title]">
    <meta property="og:description" content="[Short description]">
    <meta property="og:image" content="[Hero image URL]">
    <meta property="og:url" content="[Page URL]">
    <meta property="og:type" content="website">
    
    <!-- Meta Pixel (placeholder) -->
    <!-- <script>!function(f,b,e,v,n,t,s){...}('YOUR_PIXEL_ID');</script> -->
    
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom brand colors — sesuaikan per klien */
        :root {
            --primary: #3D7A8A;      /* contoh: Rancabango teal */
            --secondary: #C4A35A;    /* contoh: gold accent */
            --dark: #1a1a1a;
            --light: #f5f5f5;
            --white: #ffffff;
        }
    </style>
</head>
<body class="font-sans text-gray-800">

    <!-- HERO SECTION -->
    <section class="relative min-h-screen flex items-center justify-center bg-cover bg-center"
             style="background-image: url('[hero-image-url]');">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 text-center text-white px-4 max-w-3xl">
            <h1 class="text-4xl md:text-6xl font-bold mb-4">[Headline Kampanye]</h1>
            <p class="text-lg md:text-xl mb-8">[Sub-headline / supporting message]</p>
            <a href="https://wa.me/62xxx?text=[pre-filled-message]" 
               class="inline-block px-8 py-4 bg-[var(--secondary)] text-white font-bold rounded-lg text-lg hover:opacity-90 transition">
                [CTA Text — contoh: Booking Sekarang]
            </a>
        </div>
    </section>

    <!-- TRUST BAR -->
    <section class="py-6 bg-gray-100">
        <div class="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 text-center">
            <div><span class="text-2xl font-bold">[angka]</span><br><small>Tamu Puas</small></div>
            <div><span class="text-2xl font-bold">⭐ [rating]</span><br><small>Google Review</small></div>
            <div><span class="text-2xl font-bold">[angka]</span><br><small>[Metrik lain]</small></div>
        </div>
    </section>

    <!-- OFFERING / BENEFITS -->
    <section class="py-16 px-4">
        <div class="max-w-5xl mx-auto text-center">
            <h2 class="text-3xl font-bold mb-12">[Kenapa Memilih Kami?]</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <!-- Repeat for each benefit -->
                <div class="p-6 rounded-lg shadow-md">
                    <div class="text-4xl mb-4">[emoji/icon]</div>
                    <h3 class="text-xl font-bold mb-2">[Benefit Title]</h3>
                    <p class="text-gray-600">[Deskripsi singkat]</p>
                </div>
            </div>
        </div>
    </section>

    <!-- PROMO / SPECIAL OFFER -->
    <section class="py-16 px-4 bg-[var(--primary)] text-white">
        <div class="max-w-3xl mx-auto text-center">
            <p class="text-sm uppercase tracking-wider mb-2">Penawaran Spesial</p>
            <h2 class="text-3xl md:text-4xl font-bold mb-4">[Nama Promo]</h2>
            <p class="text-5xl font-bold mb-2">Rp [Harga]</p>
            <p class="line-through text-white/60 mb-6">Rp [Harga Normal]</p>
            <ul class="text-left max-w-md mx-auto mb-8 space-y-2">
                <li>✓ [Fasilitas/benefit 1]</li>
                <li>✓ [Fasilitas/benefit 2]</li>
                <li>✓ [Fasilitas/benefit 3]</li>
            </ul>
            <a href="https://wa.me/62xxx?text=[message]" 
               class="inline-block px-8 py-4 bg-white text-[var(--primary)] font-bold rounded-lg text-lg hover:opacity-90 transition">
                [CTA — Pesan Sekarang]
            </a>
            <p class="text-sm mt-4 opacity-80">*Berlaku sampai [tanggal]</p>
        </div>
    </section>

    <!-- TESTIMONIAL -->
    <section class="py-16 px-4">
        <div class="max-w-5xl mx-auto">
            <h2 class="text-3xl font-bold text-center mb-12">Kata Mereka</h2>
            <div class="grid md:grid-cols-3 gap-6">
                <!-- Repeat per testimonial -->
                <div class="p-6 border rounded-lg">
                    <div class="flex text-yellow-400 mb-2">⭐⭐⭐⭐⭐</div>
                    <p class="text-gray-600 mb-4">"[Kutipan review singkat]"</p>
                    <p class="font-bold">— [Nama Reviewer]</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CONTACT / FINAL CTA -->
    <section class="py-16 px-4 bg-gray-100">
        <div class="max-w-3xl mx-auto text-center">
            <h2 class="text-3xl font-bold mb-4">Siap untuk [aksi]?</h2>
            <p class="text-gray-600 mb-8">[Supporting text — urgency/scarcity]</p>
            <a href="https://wa.me/62xxx?text=[message]" 
               class="inline-block px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-lg hover:bg-green-600 transition">
                💬 Chat via WhatsApp
            </a>
            <div class="mt-8 text-gray-500">
                <p>📍 [Alamat lengkap]</p>
                <p>📞 [Nomor telepon]</p>
                <p>🕐 [Jam operasional]</p>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="py-6 bg-gray-900 text-gray-400 text-center text-sm">
        <p>© [Tahun] [Brand Name]. Digital marketing by <a href="https://motekreatif.com" class="text-white hover:underline">Mote Kreatif</a></p>
    </footer>

    <!-- UTM Tracking Script (placeholder) -->
    <script>
        // Track CTA clicks
        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
            link.addEventListener('click', () => {
                // Send event to analytics
                // gtag('event', 'click', { event_category: 'CTA', event_label: 'WhatsApp' });
            });
        });
    </script>
</body>
</html>
```

## Catatan Customization
- Ganti semua placeholder [...] dengan konten aktual
- Sesuaikan CSS custom properties dengan brand color klien
- Tambahkan Meta Pixel ID dan Google Analytics ID
- UTM parameters pada semua CTA links
- Test responsive di mobile sebelum launch
