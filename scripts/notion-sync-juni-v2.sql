-- Notion → Mote Team sync v2, June 2026 (status + detail).
-- Source: Notion CSV export. Scope: 3 active clients, June 2026.
-- Idempotent: INSERT WHERE NOT EXISTS (by title) + UPDATE by title.
-- Assignee skipped (team assigns in-app). Run on local first, then prod.
-- Apply with: psql --single-transaction -f this.sql  (atomic, rolls back on error).

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO [Request] - Foto Semua Catalog Rancabango Secara Proper$t$, 'in_progress', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-13', DATE '2026-06-19', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1rFiRb6a3armUg8p22OROVqp6OZodLPtF?usp=sharing$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO [Request] - Foto Semua Catalog Rancabango Secara Proper$t$);
UPDATE moteteam.task SET status = 'in_progress', due_date = DATE '2026-06-13', posting_date = DATE '2026-06-19', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1rFiRb6a3armUg8p22OROVqp6OZodLPtF?usp=sharing$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO [Request] - Foto Semua Catalog Rancabango Secara Proper$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [SLIDE POST] Mencuplik kembali Menuju Hari Baik$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-09', DATE '2026-06-09', NULL, $t$Dekorasi yang dirangkai dengan teliti, hingga setiap sudut terasa istimewa. Prosesi syahdu yang diramu begitu magis, hingga waktu seakan berjalan lebih pelan. Sajian Nusantara yang berkesan, meninggalkan kenangan di setiap lidah yang mencicipinya. Dan semuanya, dibangun dari kolaborasi banyak tangan terbaik.

Bukan sekadar acara — melainkan bukti bahwa hari bahagia bisa terasa sehangat rumah.
Untuk kamu yang punya niat baik, pintunya selalu terbuka.

#SetiapHidanganAdalahCerita #sudutceritaistimewa #SetiapRasaAdalahKenangan
#WisataGarut #restorasa$t$, $t$https://drive.google.com/drive/folders/1bHIQWTv677WSHQZ4tXP2WbuHdG8MiVRY?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/1ZreAtBs1sESnxusgp9EK5nNVtO2eWso4$t$, $t$https://www.instagram.com/p/DZXn1MDnbI0/?igsh=cnh4Ym1rOTM3OHhn$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Mencuplik kembali Menuju Hari Baik$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-09', posting_date = DATE '2026-06-09', type_content = NULL, caption = $t$Dekorasi yang dirangkai dengan teliti, hingga setiap sudut terasa istimewa. Prosesi syahdu yang diramu begitu magis, hingga waktu seakan berjalan lebih pelan. Sajian Nusantara yang berkesan, meninggalkan kenangan di setiap lidah yang mencicipinya. Dan semuanya, dibangun dari kolaborasi banyak tangan terbaik.

Bukan sekadar acara — melainkan bukti bahwa hari bahagia bisa terasa sehangat rumah.
Untuk kamu yang punya niat baik, pintunya selalu terbuka.

#SetiapHidanganAdalahCerita #sudutceritaistimewa #SetiapRasaAdalahKenangan
#WisataGarut #restorasa$t$, link_materi = $t$https://drive.google.com/drive/folders/1bHIQWTv677WSHQZ4tXP2WbuHdG8MiVRY?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1ZreAtBs1sESnxusgp9EK5nNVtO2eWso4$t$, link_ig = $t$https://www.instagram.com/p/DZXn1MDnbI0/?igsh=cnh4Ym1rOTM3OHhn$t$, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Mencuplik kembali Menuju Hari Baik$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [REELS] Liburan = Wisata = Kulineran$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-16', DATE '2026-06-21', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [REELS] Liburan = Wisata = Kulineran$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-16', posting_date = DATE '2026-06-21', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [REELS] Liburan = Wisata = Kulineran$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [SLIDE POST] Kebersamaan keluarga di momen liburan$t$, 'ready', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-15', DATE '2026-06-19', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1oYcjKQz6xWCVMdLORXbecUCzcMxc3PfO?usp=sharing$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Kebersamaan keluarga di momen liburan$t$);
UPDATE moteteam.task SET status = 'ready', due_date = DATE '2026-06-15', posting_date = DATE '2026-06-19', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1oYcjKQz6xWCVMdLORXbecUCzcMxc3PfO?usp=sharing$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Kebersamaan keluarga di momen liburan$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG & IGS - Juni - [DI PIN & DI MASUKIN HIGHLIGHT] OFFERING WEDDING Restorasa$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-14', DATE '2026-06-15', NULL, $t$https://www.instagram.com/p/DZmWbdhukLS/?igsh=cnFzcmZxcHUwcjgx$t$, NULL, $t$https://drive.google.com/drive/u/1/folders/1PX_qagoAwAUgKTij9Z1LuBUFU7aci_4t$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG & IGS - Juni - [DI PIN & DI MASUKIN HIGHLIGHT] OFFERING WEDDING Restorasa$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-14', posting_date = DATE '2026-06-15', type_content = NULL, caption = $t$https://www.instagram.com/p/DZmWbdhukLS/?igsh=cnFzcmZxcHUwcjgx$t$, link_materi = NULL, link_output = $t$https://drive.google.com/drive/u/1/folders/1PX_qagoAwAUgKTij9Z1LuBUFU7aci_4t$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IG & IGS - Juni - [DI PIN & DI MASUKIN HIGHLIGHT] OFFERING WEDDING Restorasa$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [REELS] MHB - Babak 4 - Inilah Pengalaman Pernikahan Yang Tak Ku Sangka begitu bermakna$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-12', DATE '2026-06-17', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1GD33bxfXTDZnhpSsdz89Zvcxcfiqfxbw?usp=sharing$t$, $t$https://www.instagram.com/reel/DZr7d8gO7Qs/?igsh=MWQyYXJxNDFjajFmeg==$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [REELS] MHB - Babak 4 - Inilah Pengalaman Pernikahan Yang Tak Ku Sangka begitu bermakna$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-12', posting_date = DATE '2026-06-17', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1GD33bxfXTDZnhpSsdz89Zvcxcfiqfxbw?usp=sharing$t$, link_ig = $t$https://www.instagram.com/reel/DZr7d8gO7Qs/?igsh=MWQyYXJxNDFjajFmeg==$t$, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [REELS] MHB - Babak 4 - Inilah Pengalaman Pernikahan Yang Tak Ku Sangka begitu bermakna$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [SLIDE POST] Slide Photo of MHB - Hasil dari para photographer$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-10', DATE '2026-06-11', NULL, $t$Caption jualan vibe di venue restorasa, klasik, heritage dan elegan$t$, $t$https://drive.google.com/drive/folders/13oaOe0NtUnkfxQ0X5crk30VDwW5LjOvB?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/1FHvDQ9kAzkpCo1d9fLFMuib-mNoIIoXv$t$, $t$https://www.instagram.com/p/DZbyxK1HS_M/?igsh=bHJ6Nno3c3lucDVj$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Slide Photo of MHB - Hasil dari para photographer$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-10', posting_date = DATE '2026-06-11', type_content = NULL, caption = $t$Caption jualan vibe di venue restorasa, klasik, heritage dan elegan$t$, link_materi = $t$https://drive.google.com/drive/folders/13oaOe0NtUnkfxQ0X5crk30VDwW5LjOvB?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1FHvDQ9kAzkpCo1d9fLFMuib-mNoIIoXv$t$, link_ig = $t$https://www.instagram.com/p/DZbyxK1HS_M/?igsh=bHJ6Nno3c3lucDVj$t$, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Slide Photo of MHB - Hasil dari para photographer$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [SLIDE VIDEO] Sajian yang disiapkan secara spesial$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-11', DATE '2026-06-10', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1yITqDOu4-aQHdvevOT4iUYyp_3GaLIB1?usp=sharing$t$, $t$https://www.instagram.com/p/DZe3k_THf-P/?img_index=2&igsh=MXV3cmpjOG1tazhoOA==$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [SLIDE VIDEO] Sajian yang disiapkan secara spesial$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-11', posting_date = DATE '2026-06-10', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1yITqDOu4-aQHdvevOT4iUYyp_3GaLIB1?usp=sharing$t$, link_ig = $t$https://www.instagram.com/p/DZe3k_THf-P/?img_index=2&igsh=MXV3cmpjOG1tazhoOA==$t$, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [SLIDE VIDEO] Sajian yang disiapkan secara spesial$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [SLIDE POST] Melihat anak kita menikmati hidangannya$t$, 'ready', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-15', DATE '2026-06-23', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/16Tyn_niPTRzrOUrTj4C8qQ_e-g7NjJxN?usp=sharing$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Melihat anak kita menikmati hidangannya$t$);
UPDATE moteteam.task SET status = 'ready', due_date = DATE '2026-06-15', posting_date = DATE '2026-06-23', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/16Tyn_niPTRzrOUrTj4C8qQ_e-g7NjJxN?usp=sharing$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Melihat anak kita menikmati hidangannya$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - 1 Muharam TAHUN BARU ISLAM$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-15', DATE '2026-06-16', NULL, NULL, NULL, $t$https://drive.google.com/drive/u/1/folders/1KiX5L7V70qbBg2ZgMCJ_47bce6YM6Nvx$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - 1 Muharam TAHUN BARU ISLAM$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-15', posting_date = DATE '2026-06-16', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/u/1/folders/1KiX5L7V70qbBg2ZgMCJ_47bce6YM6Nvx$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - 1 Muharam TAHUN BARU ISLAM$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [REELS] Barista peracik minuman spesial$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-04', DATE '2026-06-27', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [REELS] Barista peracik minuman spesial$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-04', posting_date = DATE '2026-06-27', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [REELS] Barista peracik minuman spesial$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [SLIDE POST] Ingin yang terbaik buat keluarga$t$, 'ready', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-15', DATE '2026-06-24', NULL, $t$caption sesuaikan dengan key message$t$, $t$https://drive.google.com/drive/folders/1aejSc5btq4P1H1PMMWeuhr1V8_-bb1tY?usp=sharing$t$, $t$https://drive.google.com/drive/folders/13CoTU6sXOXuqVQzbzeZSyWPZ2q49B7aZ?usp=sharing$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Ingin yang terbaik buat keluarga$t$);
UPDATE moteteam.task SET status = 'ready', due_date = DATE '2026-06-15', posting_date = DATE '2026-06-24', type_content = NULL, caption = $t$caption sesuaikan dengan key message$t$, link_materi = $t$https://drive.google.com/drive/folders/1aejSc5btq4P1H1PMMWeuhr1V8_-bb1tY?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/folders/13CoTU6sXOXuqVQzbzeZSyWPZ2q49B7aZ?usp=sharing$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Ingin yang terbaik buat keluarga$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IG - Juni - [REELS] Pramusaji dan pelayanan terbaik$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-20', DATE '2026-06-25', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [REELS] Pramusaji dan pelayanan terbaik$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-20', posting_date = DATE '2026-06-25', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IG - Juni - [REELS] Pramusaji dan pelayanan terbaik$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - TT - Juni - Konten - Skit: Diracun Temen Balik dari Garut (Ayam Bakar Kuah)$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-23', DATE '2026-06-25', NULL, $t$Tanya rekomendasi kuliner Garut ke temen yang baru balik, ujung-ujungnya diracun Ayam Bakar Kuah Restorasa 😌 Kuah khas dapur sendiri, nggak ada di tempat lain. Masukin itinerary liburanmu. 📍 Kawasan Stasiun Garut.

#KulinerGarut #AyamBakarKuah #WisataGarut #Restorasa #MakananNusantara$t$, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - TT - Juni - Konten - Skit: Diracun Temen Balik dari Garut (Ayam Bakar Kuah)$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-23', posting_date = DATE '2026-06-25', type_content = NULL, caption = $t$Tanya rekomendasi kuliner Garut ke temen yang baru balik, ujung-ujungnya diracun Ayam Bakar Kuah Restorasa 😌 Kuah khas dapur sendiri, nggak ada di tempat lain. Masukin itinerary liburanmu. 📍 Kawasan Stasiun Garut.

#KulinerGarut #AyamBakarKuah #WisataGarut #Restorasa #MakananNusantara$t$, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - TT - Juni - Konten - Skit: Diracun Temen Balik dari Garut (Ayam Bakar Kuah)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - TT - Juni - Konten - Skit: Bingung Makan Apa di Garut (Ayam Bakar Kua$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-23', DATE '2026-06-23', NULL, $t$Lagi di Garut dan bingung makan apa yang khas? Ayam Bakar Kuah Restorasa — kuah racikan dapur sendiri yang nggak ada di tempat lain. Jauh-jauh ke Garut, jangan pulang sebelum coba. 📍 Kawasan Stasiun Garut.

#KulinerGarut #AyamBakarKuah #Restorasa #WisataGarut #MakananNusantara$t$, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - TT - Juni - Konten - Skit: Bingung Makan Apa di Garut (Ayam Bakar Kua$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-23', posting_date = DATE '2026-06-23', type_content = NULL, caption = $t$Lagi di Garut dan bingung makan apa yang khas? Ayam Bakar Kuah Restorasa — kuah racikan dapur sendiri yang nggak ada di tempat lain. Jauh-jauh ke Garut, jangan pulang sebelum coba. 📍 Kawasan Stasiun Garut.

#KulinerGarut #AyamBakarKuah #Restorasa #WisataGarut #MakananNusantara$t$, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - TT - Juni - Konten - Skit: Bingung Makan Apa di Garut (Ayam Bakar Kua$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - TT - Juni - Wawancara Astrid 2 - [isi judul disini]$t$, 'in_progress', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-21', DATE '2026-06-22', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - TT - Juni - Wawancara Astrid 2 - [isi judul disini]$t$);
UPDATE moteteam.task SET status = 'in_progress', due_date = DATE '2026-06-21', posting_date = DATE '2026-06-22', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - TT - Juni - Wawancara Astrid 2 - [isi judul disini]$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - TT - Juni - Wawancara Astrid 1 - Testi Makanan$t$, 'done', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-20', DATE '2026-06-21', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1Tu2emhM22wGtJ1ulSLdQ3H1c9W8gmLnc$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - TT - Juni - Wawancara Astrid 1 - Testi Makanan$t$);
UPDATE moteteam.task SET status = 'done', due_date = DATE '2026-06-20', posting_date = DATE '2026-06-21', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1Tu2emhM22wGtJ1ulSLdQ3H1c9W8gmLnc$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - TT - Juni - Wawancara Astrid 1 - Testi Makanan$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - TT - Juni - Konten - Skit: 'Ayam Bakar Mah Gitu-Gitu Aja' (Myth-Bust)$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-23', DATE '2026-06-26', NULL, $t$Kalau kamu pikir udah pernah makan ayam bakar — mungkin belum yang satu ini. Ayam Bakar Kuah Restorasa, kuah racikan dapur sendiri yang nggak ada di tempat lain di Garut. Pas liburan ke Garut, buktiin sendiri. 📍 Kawasan Stasiun Garut.

#AyamBakarKuah #KulinerGarut #WisataGarut #Restorasa #MakananNusantara$t$, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - TT - Juni - Konten - Skit: 'Ayam Bakar Mah Gitu-Gitu Aja' (Myth-Bust)$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-23', posting_date = DATE '2026-06-26', type_content = NULL, caption = $t$Kalau kamu pikir udah pernah makan ayam bakar — mungkin belum yang satu ini. Ayam Bakar Kuah Restorasa, kuah racikan dapur sendiri yang nggak ada di tempat lain di Garut. Pas liburan ke Garut, buktiin sendiri. 📍 Kawasan Stasiun Garut.

#AyamBakarKuah #KulinerGarut #WisataGarut #Restorasa #MakananNusantara$t$, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - TT - Juni - Konten - Skit: 'Ayam Bakar Mah Gitu-Gitu Aja' (Myth-Bust)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IGS - Juni - Opening (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-07', DATE '2026-06-08', NULL, NULL, $t$https://drive.google.com/drive/folders/1hputmJrJD5bXWri74Is1EUO76-qr2k6y?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/1hQLCCuvciyFHg7jqbgaLNaGoqh1oUzU-$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IGS - Juni - Opening (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-07', posting_date = DATE '2026-06-08', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1hputmJrJD5bXWri74Is1EUO76-qr2k6y?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1hQLCCuvciyFHg7jqbgaLNaGoqh1oUzU-$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IGS - Juni - Opening (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IGS - Juni - Close (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-07', DATE '2026-06-07', NULL, NULL, NULL, $t$https://drive.google.com/drive/u/1/folders/1gTGpHSKEwxQUTbFkCswvTjsyDpsvjLVy$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IGS - Juni - Close (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-07', posting_date = DATE '2026-06-07', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/u/1/folders/1gTGpHSKEwxQUTbFkCswvTjsyDpsvjLVy$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IGS - Juni - Close (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IGS - Juni - Quotes (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-07', DATE '2026-06-08', NULL, NULL, $t$https://drive.google.com/drive/folders/1bZE1XniFC9KtBkbvbW5u2p_vQBstfskO?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/1oIOFlWwock-ZW-AWKxyGyG7s7djyhsVK$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IGS - Juni - Quotes (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-07', posting_date = DATE '2026-06-08', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1bZE1XniFC9KtBkbvbW5u2p_vQBstfskO?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1oIOFlWwock-ZW-AWKxyGyG7s7djyhsVK$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IGS - Juni - Quotes (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RESTORASA - IGS - Juni - Ambience Video (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Restorasa$t$), DATE '2026-06-08', DATE '2026-06-09', NULL, NULL, $t$https://drive.google.com/drive/folders/11QvvJcoXao6apwsmeqAbdyne0WNfkqug$t$, $t$https://drive.google.com/drive/u/1/folders/1IaJ-XN_xGuolb94iYHixy6oT9ZYdpTsR$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IGS - Juni - Ambience Video (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-08', posting_date = DATE '2026-06-09', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/11QvvJcoXao6apwsmeqAbdyne0WNfkqug$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1IaJ-XN_xGuolb94iYHixy6oT9ZYdpTsR$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RESTORASA - IGS - Juni - Ambience Video (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG & TT - Juni - [REELS] Lari-lari di Rancabango Hotel$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-09', DATE '2026-06-10', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1FcBIuR73tvWt82fA7tvSDhx6DY12_hr7$t$, $t$https://www.instagram.com/reel/DZbt6DgMAIg/?igsh=MWJmaHNkand2ZHEyOA==$t$, $t$https://vt.tiktok.com/ZSQ55vpvr/$t$
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG & TT - Juni - [REELS] Lari-lari di Rancabango Hotel$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-09', posting_date = DATE '2026-06-10', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1FcBIuR73tvWt82fA7tvSDhx6DY12_hr7$t$, link_ig = $t$https://www.instagram.com/reel/DZbt6DgMAIg/?igsh=MWJmaHNkand2ZHEyOA==$t$, link_tiktok = $t$https://vt.tiktok.com/ZSQ55vpvr/$t$ WHERE title = $t$RANCABANGO - IG & TT - Juni - [REELS] Lari-lari di Rancabango Hotel$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [SLIDE POST] Sudut yang memberimu ketenangan$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-07', DATE '2026-06-09', NULL, NULL, $t$https://drive.google.com/drive/folders/1V3aaWBJmG6gSU3tEw5GSJbHdBANA0b-J?usp=sharing$t$, $t$https://drive.google.com/drive/folders/1KF3vHTNRMylA8zIEywNAitw3RLx0xmiX?usp=share_link$t$, $t$https://www.instagram.com/p/DZXNLhiFL11/?igsh=M2JkbDExbmE5bHdm$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Sudut yang memberimu ketenangan$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-07', posting_date = DATE '2026-06-09', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1V3aaWBJmG6gSU3tEw5GSJbHdBANA0b-J?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/folders/1KF3vHTNRMylA8zIEywNAitw3RLx0xmiX?usp=share_link$t$, link_ig = $t$https://www.instagram.com/p/DZXNLhiFL11/?igsh=M2JkbDExbmE5bHdm$t$, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Sudut yang memberimu ketenangan$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [SLIDE POST] Liburan yang menawarkanmu sebuah jeda$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-09', DATE '2026-06-09', NULL, NULL, $t$https://drive.google.com/drive/folders/1AgAst13APZ3aBUZrvSJt6G2PAfSnj6fN?usp=sharing$t$, $t$https://drive.google.com/drive/folders/1ueVwKRML0lMERacf5rlFNAwXtccVxkUV?usp=share_link$t$, $t$https://www.instagram.com/p/DZZY6dSFBW5/?igsh=MWpqZDA2YzgwMHdjZg==$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Liburan yang menawarkanmu sebuah jeda$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-09', posting_date = DATE '2026-06-09', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1AgAst13APZ3aBUZrvSJt6G2PAfSnj6fN?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/folders/1ueVwKRML0lMERacf5rlFNAwXtccVxkUV?usp=share_link$t$, link_ig = $t$https://www.instagram.com/p/DZZY6dSFBW5/?igsh=MWpqZDA2YzgwMHdjZg==$t$, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Liburan yang menawarkanmu sebuah jeda$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Bersantai di kursi Rancabango$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-10', DATE '2026-06-11', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1nEpS1XSYkr3nL-s98mTCPOynErvLqYXP$t$, $t$https://vt.tiktok.com/ZSQa1NJ9t/$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Bersantai di kursi Rancabango$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-10', posting_date = DATE '2026-06-11', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1nEpS1XSYkr3nL-s98mTCPOynErvLqYXP$t$, link_ig = $t$https://vt.tiktok.com/ZSQa1NJ9t/$t$, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Bersantai di kursi Rancabango$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Menaiki Perahu yang membawa ketenangan$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-10', DATE '2026-06-12', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1agIQGcaJzOedtR8A6VHVU2f9HRATFj55$t$, NULL, $t$https://vt.tiktok.com/ZSQuadkEh/$t$
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Menaiki Perahu yang membawa ketenangan$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-10', posting_date = DATE '2026-06-12', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1agIQGcaJzOedtR8A6VHVU2f9HRATFj55$t$, link_ig = NULL, link_tiktok = $t$https://vt.tiktok.com/ZSQuadkEh/$t$ WHERE title = $t$RANCABANGO - TT - Juni - Menaiki Perahu yang membawa ketenangan$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG & IGS - Juni - 1 Muharam - Tahun Baru Islam$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-15', DATE '2026-06-16', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1jzJ_x24LOQKGOE2aL27cxKNAKyris5E2?usp=share_link$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG & IGS - Juni - 1 Muharam - Tahun Baru Islam$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-15', posting_date = DATE '2026-06-16', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1jzJ_x24LOQKGOE2aL27cxKNAKyris5E2?usp=share_link$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG & IGS - Juni - 1 Muharam - Tahun Baru Islam$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [SLIDE POST] Anak cepat besar dan kita telat menyadarinya$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-12', DATE '2026-06-12', NULL, $t$Ada satu hal yang tidak diceritakan saat anak lahir: bahwa setiap fase masa kecilnya hanya datang sekali.

Liburan sekolah ini, kalau Anda merasa terlalu sibuk untuk benar-benar hadir — mungkin itu justru pertanda untuk berhenti sebentar.

Escape Holiday School — Rancabango Hotel & Resort 27 Juni – 11 Juli 2026 | Mulai Rp 1.015.000
Booking langsung di Rancabango.com, kode RCB2026 untuk harga paling masuk akal.

Link di bio ↗

#APlaceToBePresent$t$, $t$https://drive.google.com/drive/folders/1w7rWSAsEFvg3bdKZJo8zjNgM8yvP4wzS?usp=sharing$t$, $t$https://drive.google.com/drive/folders/1ssbLKJeaB4Ojf2IXeyU8smXFZ0dXsLPm?usp=share_link$t$, $t$https://www.instagram.com/p/DZe2rorlEcH/?igsh=ZzFsNmExcGlzMzY5$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Anak cepat besar dan kita telat menyadarinya$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-12', posting_date = DATE '2026-06-12', type_content = NULL, caption = $t$Ada satu hal yang tidak diceritakan saat anak lahir: bahwa setiap fase masa kecilnya hanya datang sekali.

Liburan sekolah ini, kalau Anda merasa terlalu sibuk untuk benar-benar hadir — mungkin itu justru pertanda untuk berhenti sebentar.

Escape Holiday School — Rancabango Hotel & Resort 27 Juni – 11 Juli 2026 | Mulai Rp 1.015.000
Booking langsung di Rancabango.com, kode RCB2026 untuk harga paling masuk akal.

Link di bio ↗

#APlaceToBePresent$t$, link_materi = $t$https://drive.google.com/drive/folders/1w7rWSAsEFvg3bdKZJo8zjNgM8yvP4wzS?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/folders/1ssbLKJeaB4Ojf2IXeyU8smXFZ0dXsLPm?usp=share_link$t$, link_ig = $t$https://www.instagram.com/p/DZe2rorlEcH/?igsh=ZzFsNmExcGlzMzY5$t$, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Anak cepat besar dan kita telat menyadarinya$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [REELS] Semuanya ada ditanganmu$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-13', DATE '2026-06-13', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1rwUGi7f5QD38G_4BZdNWM22XyOfGzctu?usp=sharing$t$, $t$https://www.instagram.com/reel/DZhBcDfMuSy/?igsh=MTE4dmxjM3pxZWk0aw==$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [REELS] Semuanya ada ditanganmu$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-13', posting_date = DATE '2026-06-13', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1rwUGi7f5QD38G_4BZdNWM22XyOfGzctu?usp=sharing$t$, link_ig = $t$https://www.instagram.com/reel/DZhBcDfMuSy/?igsh=MTE4dmxjM3pxZWk0aw==$t$, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [REELS] Semuanya ada ditanganmu$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [SLIDE POST] "Liburan Terbaik Bukan yang Termahal"$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-13', DATE '2026-06-14', NULL, $t$Ada studi yang bilang: anak yang tumbuh dengan banyak memori sensoris — bau, suara, sentuhan alam — punya tingkat happiness lebih tinggi sebagai dewasa.

Tidak harus mahal. Tidak harus jauh.
Cukup ada momen di mana dia benar-benar hadir — dan kita ada di sana bersamanya.

Escape Holiday School — Rancabango Hotel & Resort 27 Juni – 11 Juli 2026 | Mulai Rp 1.015.000
Booking langsung di Rancabango.com, kode RCB2026.

Link di bio ↗

#APlaceToBePresent$t$, NULL, $t$https://drive.google.com/drive/folders/1Kt4AETis-Qf99mZdekzcNVc1yAUjODFG?usp=share_link$t$, $t$https://www.instagram.com/p/DZl2MaOHZWw/?img_index=6&igsh=bnU2M3QzZDhhamFk$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] "Liburan Terbaik Bukan yang Termahal"$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-13', posting_date = DATE '2026-06-14', type_content = NULL, caption = $t$Ada studi yang bilang: anak yang tumbuh dengan banyak memori sensoris — bau, suara, sentuhan alam — punya tingkat happiness lebih tinggi sebagai dewasa.

Tidak harus mahal. Tidak harus jauh.
Cukup ada momen di mana dia benar-benar hadir — dan kita ada di sana bersamanya.

Escape Holiday School — Rancabango Hotel & Resort 27 Juni – 11 Juli 2026 | Mulai Rp 1.015.000
Booking langsung di Rancabango.com, kode RCB2026.

Link di bio ↗

#APlaceToBePresent$t$, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1Kt4AETis-Qf99mZdekzcNVc1yAUjODFG?usp=share_link$t$, link_ig = $t$https://www.instagram.com/p/DZl2MaOHZWw/?img_index=6&igsh=bnU2M3QzZDhhamFk$t$, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] "Liburan Terbaik Bukan yang Termahal"$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [REELS] Mencipta Core Memory$t$, 'in_progress', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-20', DATE '2026-06-23', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [REELS] Mencipta Core Memory$t$);
UPDATE moteteam.task SET status = 'in_progress', due_date = DATE '2026-06-20', posting_date = DATE '2026-06-23', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [REELS] Mencipta Core Memory$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [SLIDE VIDEO] Suasana Rancabango Di Musim Panas Ini$t$, 'ready', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-21', DATE '2026-06-24', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1sqy6JMyLJEm7UyZlvsOPKE5wp9-TQ4RO?usp=sharing$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE VIDEO] Suasana Rancabango Di Musim Panas Ini$t$);
UPDATE moteteam.task SET status = 'ready', due_date = DATE '2026-06-21', posting_date = DATE '2026-06-24', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1sqy6JMyLJEm7UyZlvsOPKE5wp9-TQ4RO?usp=sharing$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE VIDEO] Suasana Rancabango Di Musim Panas Ini$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [SLIDE POST] Keluarga yang Bahagia adalah Keluarga yang Rindu Kebersamaan$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-23', DATE '2026-06-27', NULL, $t$Keluarga yang bahagia bukan yang tak pernah berjauhan.

Tapi yang, di tengah hari-hari yang sibuk, masih menyimpan rindu untuk berkumpul — dan memilih menjawabnya.

Rancabango Hotel & Resort menyediakan ruang untuk rindu itu pulang. Suasana tenang di kaki Gunung Guntur, untuk keluarga yang ingin benar-benar hadir satu sama lain.

Booking langsung di http://Rancabango.com, kode RCB2026 untuk harga paling masuk akal.

Link di bio ↗

#APlaceToBePresent$t$, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Keluarga yang Bahagia adalah Keluarga yang Rindu Kebersamaan$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-23', posting_date = DATE '2026-06-27', type_content = NULL, caption = $t$Keluarga yang bahagia bukan yang tak pernah berjauhan.

Tapi yang, di tengah hari-hari yang sibuk, masih menyimpan rindu untuk berkumpul — dan memilih menjawabnya.

Rancabango Hotel & Resort menyediakan ruang untuk rindu itu pulang. Suasana tenang di kaki Gunung Guntur, untuk keluarga yang ingin benar-benar hadir satu sama lain.

Booking langsung di http://Rancabango.com, kode RCB2026 untuk harga paling masuk akal.

Link di bio ↗

#APlaceToBePresent$t$, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Keluarga yang Bahagia adalah Keluarga yang Rindu Kebersamaan$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [REQUEST] Flyer Kids Activity$t$, 'scheduled', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-20', DATE '2026-06-21', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1DnBsmOFSl0waWhOwdgFmnUlxQ--Ny1Ca?usp=share_link$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [REQUEST] Flyer Kids Activity$t$);
UPDATE moteteam.task SET status = 'scheduled', due_date = DATE '2026-06-20', posting_date = DATE '2026-06-21', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1DnBsmOFSl0waWhOwdgFmnUlxQ--Ny1Ca?usp=share_link$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [REQUEST] Flyer Kids Activity$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [SLIDE POST] Layar atau Langit$t$, 'done', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-25', DATE '2026-06-28', NULL, $t$Bukan soal melarang layar. Tapi soal memberi anak sesuatu yang lebih layak dilihat.

Libur sekolah ini, ajak ia menatap langit pagi di kaki Gunung Guntur — sebelum hari-harinya kembali penuh.

Escape Holiday School — Rancabango Hotel & Resort 27 Juni – 11 Juli 2026 | Mulai Rp 1.015.000
Booking langsung di http://Rancabango.com, kode RCB2026.

Link di bio ↗

#APlaceToBePresent$t$, NULL, $t$https://drive.google.com/drive/folders/12yn3poW7BseU6h7czOtGBOoyApvZf3IC?usp=share_link$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Layar atau Langit$t$);
UPDATE moteteam.task SET status = 'done', due_date = DATE '2026-06-25', posting_date = DATE '2026-06-28', type_content = NULL, caption = $t$Bukan soal melarang layar. Tapi soal memberi anak sesuatu yang lebih layak dilihat.

Libur sekolah ini, ajak ia menatap langit pagi di kaki Gunung Guntur — sebelum hari-harinya kembali penuh.

Escape Holiday School — Rancabango Hotel & Resort 27 Juni – 11 Juli 2026 | Mulai Rp 1.015.000
Booking langsung di http://Rancabango.com, kode RCB2026.

Link di bio ↗

#APlaceToBePresent$t$, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/12yn3poW7BseU6h7czOtGBOoyApvZf3IC?usp=share_link$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Layar atau Langit$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [REELS] Bapak Ibu Juga Berhak Libur$t$, 'in_progress', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-27', DATE '2026-06-30', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [REELS] Bapak Ibu Juga Berhak Libur$t$);
UPDATE moteteam.task SET status = 'in_progress', due_date = DATE '2026-06-27', posting_date = DATE '2026-06-30', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [REELS] Bapak Ibu Juga Berhak Libur$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [REELS] Liburan Kali ini$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-17', DATE '2026-06-19', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1HgxVHbTyLeGHztl2Mvzne9IFI7pcj5HG?usp=sharing$t$, $t$https://www.instagram.com/reel/DZwmE_fMWsS/?igsh=MW1zeWM2b3V4cGt3dA==$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [REELS] Liburan Kali ini$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-17', posting_date = DATE '2026-06-19', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1HgxVHbTyLeGHztl2Mvzne9IFI7pcj5HG?usp=sharing$t$, link_ig = $t$https://www.instagram.com/reel/DZwmE_fMWsS/?igsh=MW1zeWM2b3V4cGt3dA==$t$, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [REELS] Liburan Kali ini$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IG - Juni - [SLIDE POST] Kalo liburan dihabiskan dirumah saja$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-17', DATE '2026-06-18', NULL, $t$Beberapa hari di alam, mungkin tidak akan mengubah hidup anak Anda.

Tapi sepuluh tahun dari sekarang, ketika dia ditanya "liburan masa kecil yang paling kamu ingat apa?" — Anda akan tahu jawabannya berbeda.

Escape Holiday School — Rancabango Hotel & Resort 27 Juni – 11 Juli 2026 | Mulai Rp 1.015.000
Booking langsung di Rancabango.com, kode RCB2026.

Link di bio ↗

#APlaceToBePresent$t$, NULL, $t$https://drive.google.com/drive/folders/15MaeqOG0rAf3AbvdtGMBggEyzzVM0P3O?usp=share_link$t$, $t$https://www.instagram.com/p/DZt35YmnRB_/?igsh=NXV6OHl0ZGhicjcy$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Kalo liburan dihabiskan dirumah saja$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-17', posting_date = DATE '2026-06-18', type_content = NULL, caption = $t$Beberapa hari di alam, mungkin tidak akan mengubah hidup anak Anda.

Tapi sepuluh tahun dari sekarang, ketika dia ditanya "liburan masa kecil yang paling kamu ingat apa?" — Anda akan tahu jawabannya berbeda.

Escape Holiday School — Rancabango Hotel & Resort 27 Juni – 11 Juli 2026 | Mulai Rp 1.015.000
Booking langsung di Rancabango.com, kode RCB2026.

Link di bio ↗

#APlaceToBePresent$t$, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/15MaeqOG0rAf3AbvdtGMBggEyzzVM0P3O?usp=share_link$t$, link_ig = $t$https://www.instagram.com/p/DZt35YmnRB_/?igsh=NXV6OHl0ZGhicjcy$t$, link_tiktok = NULL WHERE title = $t$RANCABANGO - IG - Juni - [SLIDE POST] Kalo liburan dihabiskan dirumah saja$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Baca Pikiran Customer$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-22', DATE '2026-06-22', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Baca Pikiran Customer$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-22', posting_date = DATE '2026-06-22', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Baca Pikiran Customer$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Buat Kakak2 Kantoran 1$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-22', DATE '2026-06-23', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Buat Kakak2 Kantoran 1$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-22', posting_date = DATE '2026-06-23', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Buat Kakak2 Kantoran 1$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Buat Kakak2 Kantoran 2$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-23', DATE '2026-06-24', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Buat Kakak2 Kantoran 2$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-23', posting_date = DATE '2026-06-24', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Buat Kakak2 Kantoran 2$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Aerial View 1$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-24', DATE '2026-06-25', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Aerial View 1$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-24', posting_date = DATE '2026-06-25', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Aerial View 1$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Aerial View 2$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-25', DATE '2026-06-26', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Aerial View 2$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-25', posting_date = DATE '2026-06-26', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Aerial View 2$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - [SLIDE POST] - Bayangin Morning Walk disini$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-26', DATE '2026-06-27', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - [SLIDE POST] - Bayangin Morning Walk disini$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-26', posting_date = DATE '2026-06-27', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - [SLIDE POST] - Bayangin Morning Walk disini$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Konten 9$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-04', NULL, NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Konten 9$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-04', posting_date = NULL, type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Konten 9$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Wawancara Astrid 2$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-21', DATE '2026-06-22', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Wawancara Astrid 2$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-21', posting_date = DATE '2026-06-22', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Wawancara Astrid 2$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - Wawancara Astrid 1$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-20', DATE '2026-06-20', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - Wawancara Astrid 1$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-20', posting_date = DATE '2026-06-20', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - Wawancara Astrid 1$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - TT - Juni - [SLIDE POST] - Bayangin sore-sore jalan disini$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-27', DATE '2026-06-28', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - TT - Juni - [SLIDE POST] - Bayangin sore-sore jalan disini$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-27', posting_date = DATE '2026-06-28', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - TT - Juni - [SLIDE POST] - Bayangin sore-sore jalan disini$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - REQUEST - Juni - Konten Escape Holiday (Buat Offline Customer) Dengan Harga Lengkap$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-06', DATE '2026-06-07', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1SwHlGklnnsWxrhSvp_MzLYuSXXlqHi4v?usp=share_link$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - REQUEST - Juni - Konten Escape Holiday (Buat Offline Customer) Dengan Harga Lengkap$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-06', posting_date = DATE '2026-06-07', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1SwHlGklnnsWxrhSvp_MzLYuSXXlqHi4v?usp=share_link$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - REQUEST - Juni - Konten Escape Holiday (Buat Offline Customer) Dengan Harga Lengkap$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IGS - Juni - Open (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-07', DATE '2026-06-07', NULL, NULL, $t$https://drive.google.com/drive/folders/1OpXvgKbTy4zZM7FIMCQ2MV0aWbZIGcv-?usp=sharing$t$, $t$https://drive.google.com/drive/folders/1Q76TNzx49ufIHPPinlAJXu0R7eg5EhLO?usp=share_link$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IGS - Juni - Open (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-07', posting_date = DATE '2026-06-07', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1OpXvgKbTy4zZM7FIMCQ2MV0aWbZIGcv-?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/folders/1Q76TNzx49ufIHPPinlAJXu0R7eg5EhLO?usp=share_link$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IGS - Juni - Open (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IGS - Juni - Quotes berdasarkan Offering (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-05', DATE '2026-06-06', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1PTFd72ek3Puu3o0H_Fct9W1M8-7sAf5A?usp=share_link$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IGS - Juni - Quotes berdasarkan Offering (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-06', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1PTFd72ek3Puu3o0H_Fct9W1M8-7sAf5A?usp=share_link$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IGS - Juni - Quotes berdasarkan Offering (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IGS - Juni - Close (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-07', DATE '2026-06-07', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1ueMG6NMkZ5NSD-wefSamHjuYowVU1pRG?usp=share_link$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IGS - Juni - Close (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-07', posting_date = DATE '2026-06-07', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1ueMG6NMkZ5NSD-wefSamHjuYowVU1pRG?usp=share_link$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IGS - Juni - Close (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IGS - Juni - Video Ambience (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-07', DATE '2026-06-08', NULL, NULL, $t$https://drive.google.com/drive/folders/1tH1y6qQ2OJbqkVMA8VupZKsMgLHt69BB?usp=share_link$t$, $t$https://drive.google.com/drive/folders/1ANV8NzBaj74pqo3V2cE11KKoc00l6ebo?usp=sharing$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IGS - Juni - Video Ambience (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-07', posting_date = DATE '2026-06-08', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1tH1y6qQ2OJbqkVMA8VupZKsMgLHt69BB?usp=share_link$t$, link_output = $t$https://drive.google.com/drive/folders/1ANV8NzBaj74pqo3V2cE11KKoc00l6ebo?usp=sharing$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IGS - Juni - Video Ambience (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$RANCABANGO - IGS - Juni - Interaksi (15)$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Rancabango Hotel & Resort$t$), DATE '2026-06-06', DATE '2026-06-07', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IGS - Juni - Interaksi (15)$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-06', posting_date = DATE '2026-06-07', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$RANCABANGO - IGS - Juni - Interaksi (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - Video + Quotes 1$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-06', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/15775U3ooNxCv-CUtt5A4XpV7S2xwojCl$t$, $t$https://www.instagram.com/reel/DZP58WRPTjj/?igsh=cGxuNHAxa3oyYXBm$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - Video + Quotes 1$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-06', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/15775U3ooNxCv-CUtt5A4XpV7S2xwojCl$t$, link_ig = $t$https://www.instagram.com/reel/DZP58WRPTjj/?igsh=cGxuNHAxa3oyYXBm$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - Video + Quotes 1$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - Video + Quotes 2$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-09', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1n2553NXwJoPBdyaURhm4Z4R3RmwSfmCA$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - Video + Quotes 2$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-09', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1n2553NXwJoPBdyaURhm4Z4R3RmwSfmCA$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - Video + Quotes 2$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - Ceritain Makanan dan Tempatnya$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-07', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1vABc6eFH-ekSP9hQ9JOdDuY7FVvkFtgu$t$, $t$https://www.instagram.com/reel/DZY7W_Dzy8v/?igsh=cTQzMjExb2ZzeHFp$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - Ceritain Makanan dan Tempatnya$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-07', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1vABc6eFH-ekSP9hQ9JOdDuY7FVvkFtgu$t$, link_ig = $t$https://www.instagram.com/reel/DZY7W_Dzy8v/?igsh=cTQzMjExb2ZzeHFp$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - Ceritain Makanan dan Tempatnya$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - Visit ke Kedai Nasi Sinar Berkah$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-15', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1uBG6HnWZDTGTr6JtKBiV-zlzZ4LHruRX$t$, $t$https://www.instagram.com/reel/DZmAn8uP1M0/?igsh=b3VkcGUxcDNqYTc0$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - Visit ke Kedai Nasi Sinar Berkah$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-15', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1uBG6HnWZDTGTr6JtKBiV-zlzZ4LHruRX$t$, link_ig = $t$https://www.instagram.com/reel/DZmAn8uP1M0/?igsh=b3VkcGUxcDNqYTc0$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - Visit ke Kedai Nasi Sinar Berkah$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni -  [SLIDE VIDEO] Bahagia ala Kedai Nasi Sinar Berkah$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-16', NULL, NULL, $t$https://drive.google.com/drive/folders/1WZPxz0ulWtqOiXLlLYE4NcybWycCDYJQ?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/1ufFO1kPZyOFXUMfGx0eUN9X0Bep-zJlf$t$, $t$https://www.instagram.com/p/DZpM6WEjyB4/?igsh=MXMyZTR3Y296Njdq$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni -  [SLIDE VIDEO] Bahagia ala Kedai Nasi Sinar Berkah$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-16', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1WZPxz0ulWtqOiXLlLYE4NcybWycCDYJQ?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1ufFO1kPZyOFXUMfGx0eUN9X0Bep-zJlf$t$, link_ig = $t$https://www.instagram.com/p/DZpM6WEjyB4/?igsh=MXMyZTR3Y296Njdq$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni -  [SLIDE VIDEO] Bahagia ala Kedai Nasi Sinar Berkah$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - [SLIDE VIDEO] Buat kamu para pencari kebahagiaan lewat rasa manis$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-11', NULL, NULL, $t$https://drive.google.com/drive/folders/1yI5ahmXu7f9yFivlxc6LSNzsHuc-KVva?usp=share_link$t$, $t$https://drive.google.com/drive/u/1/folders/1BAsDv90qqC9sx4UgrinTTbVwg3GhHl4L$t$, $t$https://www.instagram.com/p/DZcBPlWD4_S/?igsh=YWF3cmJqOW5pcnlo$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - [SLIDE VIDEO] Buat kamu para pencari kebahagiaan lewat rasa manis$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-11', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1yI5ahmXu7f9yFivlxc6LSNzsHuc-KVva?usp=share_link$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1BAsDv90qqC9sx4UgrinTTbVwg3GhHl4L$t$, link_ig = $t$https://www.instagram.com/p/DZcBPlWD4_S/?igsh=YWF3cmJqOW5pcnlo$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - [SLIDE VIDEO] Buat kamu para pencari kebahagiaan lewat rasa manis$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - [SLIDE VIDEO] Mitos tentang makanan dan pernagaruhnya terhadap kebahagiaan?$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-13', NULL, NULL, $t$https://drive.google.com/drive/folders/1_VJg8OwtgFMbnNk0TLCtv2wDXT5KJFJK?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/133mdDaKZLaCDt-gQEL6U4INHtgzSU8za$t$, $t$https://www.instagram.com/p/DZhCNSxj_5c/?igsh=MXZuZTNyMmdxeHI0aQ==$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - [SLIDE VIDEO] Mitos tentang makanan dan pernagaruhnya terhadap kebahagiaan?$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-13', type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1_VJg8OwtgFMbnNk0TLCtv2wDXT5KJFJK?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/133mdDaKZLaCDt-gQEL6U4INHtgzSU8za$t$, link_ig = $t$https://www.instagram.com/p/DZhCNSxj_5c/?igsh=MXZuZTNyMmdxeHI0aQ==$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - [SLIDE VIDEO] Mitos tentang makanan dan pernagaruhnya terhadap kebahagiaan?$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] Kerja fokus gak mikirin makan siang - Nasi Box untuk Kantoran$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-14', DATE '2026-06-17', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1Kh_NpY_cM8nJh9tUokooguD5OE9iCxGh?usp=share_link$t$, $t$https://www.instagram.com/p/DZrO37aDxmK/?igsh=dXVjNGh3ZzdsN2o5$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] Kerja fokus gak mikirin makan siang - Nasi Box untuk Kantoran$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-14', posting_date = DATE '2026-06-17', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1Kh_NpY_cM8nJh9tUokooguD5OE9iCxGh?usp=share_link$t$, link_ig = $t$https://www.instagram.com/p/DZrO37aDxmK/?igsh=dXVjNGh3ZzdsN2o5$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] Kerja fokus gak mikirin makan siang - Nasi Box untuk Kantoran$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] In this economy bahagia itu susah - Nasi Box untuk yang mager syukuran$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-14', DATE '2026-06-18', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1-ZleMdPHAEM8HeoPfgMyie2X6Bu2Mj5C?usp=share_link$t$, $t$https://www.instagram.com/p/DZtrbeFj-Dh/?igsh=MW9xeHkyaGh3eGRkMw==$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] In this economy bahagia itu susah - Nasi Box untuk yang mager syukuran$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-14', posting_date = DATE '2026-06-18', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1-ZleMdPHAEM8HeoPfgMyie2X6Bu2Mj5C?usp=share_link$t$, link_ig = $t$https://www.instagram.com/p/DZtrbeFj-Dh/?igsh=MW9xeHkyaGh3eGRkMw==$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] In this economy bahagia itu susah - Nasi Box untuk yang mager syukuran$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-06', DATE '2026-06-10', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1gsSJO3z3iF57qojIEiwL4UzD_7zCJpih?usp=sharing$t$, $t$https://vt.tiktok.com/ZSQAAXrQh/$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-06', posting_date = DATE '2026-06-10', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1gsSJO3z3iF57qojIEiwL4UzD_7zCJpih?usp=sharing$t$, link_ig = $t$https://vt.tiktok.com/ZSQAAXrQh/$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Kasir dan segala aktivitasnya$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-06', DATE '2026-06-08', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1nyqnSA94itp4Gp-V76BXS3c9ItP0Iy2E?usp=sharing$t$, $t$https://vt.tiktok.com/ZSQ6P8sox/$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Kasir dan segala aktivitasnya$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-06', posting_date = DATE '2026-06-08', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1nyqnSA94itp4Gp-V76BXS3c9ItP0Iy2E?usp=sharing$t$, link_ig = $t$https://vt.tiktok.com/ZSQ6P8sox/$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Kasir dan segala aktivitasnya$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Video + Quotes 1$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-09', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1jpCj106lfsi7JFOaPIU2wznPHE-QCLbR$t$, $t$https://vt.tiktok.com/ZSQk7JhMT/$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes 1$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-09', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1jpCj106lfsi7JFOaPIU2wznPHE-QCLbR$t$, link_ig = $t$https://vt.tiktok.com/ZSQk7JhMT/$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes 1$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Video + Quotes 2$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-11', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1YhUZLRKvNURL2K5leQVPK8A6RpFYPad9$t$, $t$https://vt.tiktok.com/ZSQybhnQG/$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes 2$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-11', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1YhUZLRKvNURL2K5leQVPK8A6RpFYPad9$t$, link_ig = $t$https://vt.tiktok.com/ZSQybhnQG/$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes 2$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Penjaga Warung Manis dan segala aktivitasnya$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-13', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1rXWp7KulY0JTd6JSdw64GXWYi3Aa_BMS?usp=sharing$t$, NULL, $t$https://vt.tiktok.com/ZSQgwX4om/$t$
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Penjaga Warung Manis dan segala aktivitasnya$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-13', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1rXWp7KulY0JTd6JSdw64GXWYi3Aa_BMS?usp=sharing$t$, link_ig = NULL, link_tiktok = $t$https://vt.tiktok.com/ZSQgwX4om/$t$ WHERE title = $t$SINARBERKAH - TT - Juni - Penjaga Warung Manis dan segala aktivitasnya$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Pelayanan dengan segala aktivitasnya$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-12', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1n4YCIQ0F21dNwCgvOv_dRYDh7wRAi8D3?usp=share_link$t$, $t$https://vt.tiktok.com/ZSQPndPn2/$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Pelayanan dengan segala aktivitasnya$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-12', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1n4YCIQ0F21dNwCgvOv_dRYDh7wRAi8D3?usp=share_link$t$, link_ig = $t$https://vt.tiktok.com/ZSQPndPn2/$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Pelayanan dengan segala aktivitasnya$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Ceritain Makanan + Angle Detail$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-14', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1uu5uQHoH8ToDHM9fo4OZTmoG8v6QK-6j$t$, $t$https://vt.tiktok.com/ZSQxqBPxd/$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Ceritain Makanan + Angle Detail$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-14', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1uu5uQHoH8ToDHM9fo4OZTmoG8v6QK-6j$t$, link_ig = $t$https://vt.tiktok.com/ZSQxqBPxd/$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Ceritain Makanan + Angle Detail$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Video + Quotes: Ekspresi senang akhirnya BM terealisasi$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-18', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1zxProPRG8Ha0Q-RzvTJ7mFp0vhSpXbIU$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: Ekspresi senang akhirnya BM terealisasi$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-18', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1zxProPRG8Ha0Q-RzvTJ7mFp0vhSpXbIU$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: Ekspresi senang akhirnya BM terealisasi$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Video + Quotes: POV pacar yang sebel makanan harus difoto dulu baru dimakan$t$, 'scheduled', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-20', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1wGj5LVcT9xE6vT9S-hEIR7qLJEzuY-PR$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: POV pacar yang sebel makanan harus difoto dulu baru dimakan$t$);
UPDATE moteteam.task SET status = 'scheduled', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-20', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1wGj5LVcT9xE6vT9S-hEIR7qLJEzuY-PR$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: POV pacar yang sebel makanan harus difoto dulu baru dimakan$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Video + Quotes: Sedih$t$, 'ready', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', DATE '2026-06-22', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1q8W8ezsClejMWq9xrWDm3alKqjBp0R7e$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: Sedih$t$);
UPDATE moteteam.task SET status = 'ready', due_date = DATE '2026-06-05', posting_date = DATE '2026-06-22', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1q8W8ezsClejMWq9xrWDm3alKqjBp0R7e$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: Sedih$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - Campaign Strategy - Juni - DECK$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', NULL, NULL, NULL, NULL, $t$https://docs.google.com/presentation/d/1pe_iWLOQR56_GPKa0XGIBwi5ZqOvBfnYSp6ca5xtr40/edit?usp=sharing$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - Campaign Strategy - Juni - DECK$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = NULL, type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://docs.google.com/presentation/d/1pe_iWLOQR56_GPKa0XGIBwi5ZqOvBfnYSp6ca5xtr40/edit?usp=sharing$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - Campaign Strategy - Juni - DECK$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IGS - Juni - OPEN (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-08', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1CxT122LxC1CF7khkEJQ8oA5swZNYrlr1?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/11yo53oiYW66hZeKB7aWUOvIcvpBceTyW$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IGS - Juni - OPEN (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-08', posting_date = NULL, type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1CxT122LxC1CF7khkEJQ8oA5swZNYrlr1?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/11yo53oiYW66hZeKB7aWUOvIcvpBceTyW$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IGS - Juni - OPEN (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IGS - Juni - TUTUP (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-08', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1ZNYvBK1emW34Z0j_qVMGcjRkmkipTrwe?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/1fCX8vnGY0j0qgG6hL3uvAa042blqXl4A$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IGS - Juni - TUTUP (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-08', posting_date = NULL, type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1ZNYvBK1emW34Z0j_qVMGcjRkmkipTrwe?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1fCX8vnGY0j0qgG6hL3uvAa042blqXl4A$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IGS - Juni - TUTUP (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IGS - Juni - VIDEO + QUOTES BAHAGIA (15)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1hTV5SHAB8x3OGICedsMariCyn0BiCHBa?usp=sharing$t$, $t$https://drive.google.com/drive/u/1/folders/1lqCoUHEwxF2IN3jrsY4rOokqw8Sbon0F$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IGS - Juni - VIDEO + QUOTES BAHAGIA (15)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = NULL, type_content = NULL, caption = NULL, link_materi = $t$https://drive.google.com/drive/folders/1hTV5SHAB8x3OGICedsMariCyn0BiCHBa?usp=sharing$t$, link_output = $t$https://drive.google.com/drive/u/1/folders/1lqCoUHEwxF2IN3jrsY4rOokqw8Sbon0F$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IGS - Juni - VIDEO + QUOTES BAHAGIA (15)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IGS - Juni - INTERAKSI (8)$t$, 'in_progress', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', NULL, NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IGS - Juni - INTERAKSI (8)$t$);
UPDATE moteteam.task SET status = 'in_progress', due_date = DATE '2026-06-05', posting_date = NULL, type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IGS - Juni - INTERAKSI (8)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IGS - Juni - Template Repost (7)$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-05', NULL, NULL, NULL, NULL, $t$https://drive.google.com/drive/u/1/folders/1sBRnBjTx7hK8fVGj4uGI2EQrrHa3K-lW$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IGS - Juni - Template Repost (7)$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-05', posting_date = NULL, type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/u/1/folders/1sBRnBjTx7hK8fVGj4uGI2EQrrHa3K-lW$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IGS - Juni - Template Repost (7)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] Bahagia ditempuh dari rasa tenang - Nasi Box untuk Gathering$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-14', DATE '2026-06-19', NULL, NULL, NULL, $t$https://drive.google.com/drive/folders/1x7QQlu8d0OSozcBh_SKUrGqPAcsdntaF?usp=share_link$t$, $t$https://www.instagram.com/p/DZwS0RPj08I/?igsh=MTdkcGg4YmRhbWU2eA==$t$, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] Bahagia ditempuh dari rasa tenang - Nasi Box untuk Gathering$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-14', posting_date = DATE '2026-06-19', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$https://drive.google.com/drive/folders/1x7QQlu8d0OSozcBh_SKUrGqPAcsdntaF?usp=share_link$t$, link_ig = $t$https://www.instagram.com/p/DZwS0RPj08I/?igsh=MTdkcGg4YmRhbWU2eA==$t$, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] Bahagia ditempuh dari rasa tenang - Nasi Box untuk Gathering$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya (2)$t$, 'in_progress', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-23', DATE '2026-06-24', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya (2)$t$);
UPDATE moteteam.task SET status = 'in_progress', due_date = DATE '2026-06-23', posting_date = DATE '2026-06-24', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya (2)$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IG - Juni - [REELS] Konten Dapur$t$, 'not_started', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-22', DATE '2026-06-22', NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - [REELS] Konten Dapur$t$);
UPDATE moteteam.task SET status = 'not_started', due_date = DATE '2026-06-22', posting_date = DATE '2026-06-22', type_content = NULL, caption = NULL, link_materi = NULL, link_output = NULL, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IG - Juni - [REELS] Konten Dapur$t$;

INSERT INTO moteteam.task (title, status, client_id, due_date, posting_date, type_content, caption, link_materi, link_output, link_ig, link_tiktok)
SELECT $t$SINARBERKAH - IGS - Juni - 1 Muharamm$t$, 'published', (SELECT id FROM moteteam.client WHERE name = $t$Kedai Nasi Sinar Berkah$t$), DATE '2026-06-16', DATE '2026-06-16', NULL, NULL, NULL, $t$\https://drive.google.com/drive/folders/1uReZEpCIRaOKI8cszKDuTkskhrrnYY-N?usp=share_link$t$, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IGS - Juni - 1 Muharamm$t$);
UPDATE moteteam.task SET status = 'published', due_date = DATE '2026-06-16', posting_date = DATE '2026-06-16', type_content = NULL, caption = NULL, link_materi = NULL, link_output = $t$\https://drive.google.com/drive/folders/1uReZEpCIRaOKI8cszKDuTkskhrrnYY-N?usp=share_link$t$, link_ig = NULL, link_tiktok = NULL WHERE title = $t$SINARBERKAH - IGS - Juni - 1 Muharamm$t$;
