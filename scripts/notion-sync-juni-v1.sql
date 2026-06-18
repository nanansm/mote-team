-- Notion → Mote Team sync, June 2026 (task baru + status).
-- One-time, guarded by app_setting flag 'notion_sync_juni_v1' in migrate-prod.
-- INSERTs are WHERE NOT EXISTS (by exact title) → idempotent, never duplicate.
-- UPDATEs match existing prod tasks by exact title → set Notion's status.
-- Assignees intentionally left empty (Notion person-IDs unresolvable via API);
-- the team assigns in-app.

-- ============================ A. TASK BARU (19) ============================
-- Kedai Nasi Sinar Berkah (SINARBERKAH)
INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - IGS - Juni - 1 Muharamm$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-16'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IGS - Juni - 1 Muharamm$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - IG - Juni - [REELS] Penjaga konter bubur manis dan segala aktivitasnya$t$, 'not_started',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-14'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IG - Juni - [REELS] Penjaga konter bubur manis dan segala aktivitasnya$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - TT - Juni - Pelayanan dengan segala aktivitasnya$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-05'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Pelayanan dengan segala aktivitasnya$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - TT - Juni - Video + Quotes: Ekspresi senang akhirnya BM terealisasi$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-05'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: Ekspresi senang akhirnya BM terealisasi$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - TT - Juni - Video + Quotes: POV pacar yang sebel makanan harus difoto dulu baru dimakan$t$, 'ready',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-05'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: POV pacar yang sebel makanan harus difoto dulu baru dimakan$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - TT - Juni - Video + Quotes: Sedih$t$, 'ready',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-05'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Video + Quotes: Sedih$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya (2)$t$, 'not_started',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-14'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya (2)$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - Campaign Strategy - Juni - DECK$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-05'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - Campaign Strategy - Juni - DECK$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$SINARBERKAH - IGS - Juni - Template Repost (7)$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Kedai Nasi Sinar Berkah'), '2026-06-05'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$SINARBERKAH - IGS - Juni - Template Repost (7)$t$);

-- Rancabango Hotel & Resort
INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RANCABANGO [Request] - Foto Semua Catalog Rancabango Secara Proper$t$, 'in_progress',
  (SELECT id FROM moteteam.client WHERE name = 'Rancabango Hotel & Resort'), '2026-06-13'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO [Request] - Foto Semua Catalog Rancabango Secara Proper$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RANCABANGO - IGS - Juni - Video Ambience (15)$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Rancabango Hotel & Resort'), '2026-06-07'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IGS - Juni - Video Ambience (15)$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RANCABANGO - IGS - Juni - Quotes berdasarkan Offering (15)$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Rancabango Hotel & Resort'), '2026-06-05'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - IGS - Juni - Quotes berdasarkan Offering (15)$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RANCABANGO - REQUEST - Juni - Konten Escape Holiday (Buat Offline Customer) Dengan Harga Lengkap$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Rancabango Hotel & Resort'), '2026-06-06'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RANCABANGO - REQUEST - Juni - Konten Escape Holiday (Buat Offline Customer) Dengan Harga Lengkap$t$);

-- Restorasa
INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RESTORASA - IG - Juni - [SLIDE POST] Slide Photo of MHB - Hasil dari para photographer$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Restorasa'), '2026-06-10'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [SLIDE POST] Slide Photo of MHB - Hasil dari para photographer$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RESTORASA - IG - Juni - [SLIDE VIDEO] Sajian yang disiapkan secara spesial$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Restorasa'), '2026-06-11'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [SLIDE VIDEO] Sajian yang disiapkan secara spesial$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RESTORASA - IG - Juni - 1 Muharam TAHUN BARU ISLAM$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Restorasa'), '2026-06-15'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - 1 Muharam TAHUN BARU ISLAM$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RESTORASA - IG - Juni - [REELS] MHB - Babak 4 - Inilah Pengalaman Pernikahan Yang Tak Ku Sangka begitu bermakna$t$, 'published',
  (SELECT id FROM moteteam.client WHERE name = 'Restorasa'), '2026-06-12'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [REELS] MHB - Babak 4 - Inilah Pengalaman Pernikahan Yang Tak Ku Sangka begitu bermakna$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RESTORASA - IG - Juni - [REELS] Liburan = Wisata = Kulineran$t$, 'not_started',
  (SELECT id FROM moteteam.client WHERE name = 'Restorasa'), '2026-06-16'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [REELS] Liburan = Wisata = Kulineran$t$);

INSERT INTO moteteam.task (title, status, client_id, due_date)
SELECT $t$RESTORASA - IG - Juni - [REELS] Pramusaji dan pelayanan terbaik$t$, 'not_started',
  (SELECT id FROM moteteam.client WHERE name = 'Restorasa'), '2026-06-20'
WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = $t$RESTORASA - IG - Juni - [REELS] Pramusaji dan pelayanan terbaik$t$);

-- ====================== B. STATUS UPDATE (12) ======================
-- Match existing prod tasks by exact title → set Notion status.
UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$SINARBERKAH - IGS - Juni - VIDEO + QUOTES BAHAGIA (15)$t$ AND status<>'published';

UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$SINARBERKAH - IGS - Juni - TUTUP (15)$t$ AND status<>'published';

UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] In this economy bahagia itu susah - Nasi Box untuk yang mager syukuran$t$ AND status<>'published';

UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$SINARBERKAH - IG - Juni - Visit ke Kedai Nasi Sinar Berkah$t$ AND status<>'published';

UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$SINARBERKAH - IG - Juni - [ADS SLIDE POST] Kerja fokus gak mikirin makan siang - Nasi Box untuk Kantoran$t$ AND status<>'published';

UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$SINARBERKAH - IG - Juni - [SLIDE VIDEO] Bahagia ala Kedai Nasi Sinar Berkah$t$ AND status<>'published';

UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$SINARBERKAH - TT - Juni - Penjaga Warung Manis dan segala aktivitasnya$t$ AND status<>'published';

UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$SINARBERKAH - TT - Juni - Ceritain Makanan + Angle Detail$t$ AND status<>'published';

UPDATE moteteam.task SET status='ready', updated_at=now()
WHERE title=$t$RESTORASA - IG - Juni - [SLIDE POST] Ingin yang terbaik buat keluarga$t$ AND status<>'ready';

UPDATE moteteam.task SET status='in_progress', updated_at=now()
WHERE title=$t$RESTORASA - IG - Juni - [SLIDE POST] Melihat anak kita menikmati hidangannya$t$ AND status<>'in_progress';

UPDATE moteteam.task SET status='in_progress', updated_at=now()
WHERE title=$t$RESTORASA - IG - Juni - [SLIDE POST] Kebersamaan keluarga di momen liburan$t$ AND status<>'in_progress';

UPDATE moteteam.task SET status='published', updated_at=now()
WHERE title=$t$RESTORASA - IG & IGS - Juni - [DI PIN & DI MASUKIN HIGHLIGHT] OFFERING WEDDING Restorasa$t$ AND status<>'published';
