/**
 * One-off migration of recent (last ~3 months) Notion Master Task rows for the
 * active clients into moteteam.task. Source data pulled from the Notion MCP
 * search (title + last-edited date). Status/type are inferred from the title
 * convention (KLIEN - PLATFORM - BULAN - [TYPE] Judul); the team refines later.
 *
 * Run: npm run migrate:tasks
 */
import { and, eq } from "drizzle-orm";
import { db } from "../src/db";
import { client, task } from "../src/db/schema";

type Raw = [title: string, date: string];

// [title, YYYY-MM-DD] per active client. Pulled 2026-06-13.
const DATA: Record<string, Raw[]> = {
  "Rancabango Hotel & Resort": [
    ["RANCABANGO - IGS - Juni - Open (15)", "2026-06-10"],
    ["RANCABANGO - IG - Juni - [SLIDE POST] Kalo liburan dihabiskan dirumah saja", "2026-06-11"],
    ['RANCABANGO - IG - Juni - [SLIDE POST] "Liburan Terbaik Bukan yang Termahal"', "2026-06-11"],
    ["RANCABANGO - IG - Juni - [SLIDE POST] Liburan yang menawarkanmu sebuah jeda", "2026-06-11"],
    ["RANCABANGO - TT - Juni - Bersantai di kursi Rancabango", "2026-06-12"],
    ["RANCABANGO - IG - Juni - [REELS] Liburan Kali ini", "2026-06-11"],
    ["RANCABANGO - IG - Mei - SLIDE VIDEO - Fotomu gak harus estetik", "2026-05-14"],
    ["Rancabango - Maret - INSTAGRAM PROFILE Setup", "2026-03-05"],
    ["RANCABANGO IG - April - REELS: Grouping Campaign", "2026-04-20"],
    ["RANCABANGO IG - April - Rancabango Wellness", "2026-04-24"],
    ["RANCABANGO - IG - Juni - [SLIDE POST] Anak cepat besar dan kita telat menyadarinya", "2026-06-12"],
    ["RANCABANGO - IGS - Juni - Close (15)", "2026-06-10"],
    ["RANCABANGO - IGS - Juni - Interaksi (15)", "2026-06-12"],
    ["RANCABANGO IG & IGS - POSTER COVER CAMPAIGN MAY — May Escape Campaign Bridging", "2026-05-08"],
    ['RANCABANGO - IG (TT) - Mei - [SLIDE POST] "Healing Bali, Tapi Tanpa Harga Bali"', "2026-05-27"],
    ["RANCABANGO - IG - Mei - SLIDE PHOTO - bukan menyendiri, kamu justru sedang pulih", "2026-05-16"],
    ["RANCABANGO - IG & TT - Juni - [REELS] Lari-lari di Rancabango Hotel", "2026-06-12"],
    ["RANCABANGO - IG - Juni - [SLIDE POST] Sudut yang memberimu ketenangan", "2026-06-09"],
    ["RANCABANGO TT - April - SLIDE POST: Tempat Tanpa Notifikasi", "2026-04-29"],
    ["RANCABANGO - IG - Mei - [REELS] Momen yang lebih mahal dari apapun", "2026-05-17"],
    ["RANCABANGO IG & IGS - Offering POSTER 2 — Family Mini Escape", "2026-05-08"],
    ["RANCABANGO IG - April - REELS: Nuansa Kental Bali di Rancabango Hotel & Resort", "2026-04-26"],
    ["RANCABANGO TT - April - VIDEO: Fitur Underrated di rancabango", "2026-04-30"],
    ["RANCABANGO - IGS - Mei - OPEN (15)", "2026-05-11"],
    ["RANCABANGO [Request] - Drone Take Content - RCBG AERIAL VIDEOGRAPHY COVERING ALL AREA", "2026-05-25"],
  ],
  Restorasa: [
    ["RESTORASA - Maret - INSTAGRAM PROFILE Setup", "2026-03-05"],
    ["RESTORASA - IG & (TT) - Mei - [REELS] Hal menarik menjadikan Restorasa sebagai Venue pernikahan", "2026-05-26"],
    ["RESTORASA - IG - Mei - [SINGLE POST] - #MenujuHariBaik - Coming Soon", "2026-05-11"],
    ["RESTORASA - IG - Mei - [SLIDE POST] Apa itu Menuju Hari Baik?", "2026-05-26"],
    ["RESTORASA - IG & IGS - Juni - [DI PIN & DI MASUKIN HIGHLIGHT] OFFERING WEDDING Restorasa", "2026-06-13"],
    ['RESTORASA - DECK - Mei - Meredesign Deck Offering "Menuju Hari Baik" Wedding Offering Restorasa', "2026-05-27"],
    ["RESTORASA - IG - Juni - [SLIDE POST] Mencuplik kembali Menuju Hari Baik", "2026-06-09"],
    ["RESTORASA - IG - Mei - [REELS] Venue Wedding Restorasa sebelum dan sesudah", "2026-05-14"],
    ["RESTORASA - IGS - Juni - Close (15)", "2026-06-12"],
    ["RESTORASA IG - April - SLIDE POST - Gathering Selalu Spesial di Restorasa", "2026-04-29"],
    ["RESTORASA - IG - Juni - [SLIDE POST] Melihat anak kita menikmati hidangannya", "2026-06-11"],
    ["RESTORASA - IG - Juni - [SLIDE POST] Ingin yang terbaik buat keluarga", "2026-06-11"],
    ["RESTORASA IG - Maret - Slide Video & Photo - Sebuah event yang dirancang menangkap makna ikatan", "2026-03-30"],
    ["RESTORASA - IG [TT] - Mei - [REELS] Minuman di Restorasa Bukan hanya segelas kenikmatan", "2026-05-20"],
    ["RESTORASA - TT (IG) - Mei - Highlight Para Collaborator", "2026-06-04"],
    ["RESTORASA - IG - Juni - [SLIDE POST] Kebersamaan keluarga di momen liburan", "2026-06-11"],
    ["RESTORASA - IGS - Juni - Opening (15)", "2026-06-10"],
    ["RESTORASA - Offering PDF - Offering Wedding Venue & Catering with Full Package Review", "2026-05-27"],
    ["RESTORASA IG - April - SLIDE VIDEO - Ayam Bakar Kuah - Sajian yang Menyenangkan Mata dan memperkaya Rasa", "2026-04-30"],
  ],
  "Kedai Nasi Sinar Berkah": [
    ["SINARBERKAH - IG - Juni - [SLIDE VIDEO] Bahagia ala Kedai Nasi Sinar Berkah", "2026-06-12"],
    ["SINARBERKAH - IG - Juni - [ADS SLIDE POST] Kerja fokus gak mikirin makan siang - Nasi Box untuk Kantoran", "2026-06-13"],
    ["SINARBERKAH - IG - Juni - Visit ke Kedai Nasi Sinar Berkah", "2026-06-12"],
    ["SINARBERKAH - IG - Juni - [SLIDE VIDEO] Buat kamu para pencari kebahagiaan lewat rasa manis", "2026-06-11"],
    ["SINARBERKAH - IG - Juni - [SLIDE VIDEO] Mitos tentang makanan dan pengaruhnya terhadap kebahagiaan?", "2026-06-13"],
    ["SINARBERKAH - IG - Juni - [ADS SLIDE POST] Bahagia ditempuh dari rasa tenang - Nasi Box untuk Gathering", "2026-06-13"],
    ["SINARBERKAH - IG - Juni - Video + Quotes 1", "2026-06-06"],
    ["SINARBERKAH - IG - Juni - [ADS SLIDE POST] In this economy bahagia itu susah - Nasi Box untuk yang mager syukuran", "2026-06-13"],
    ["SINARBERKAH - TT - Juni - Video + Quotes 2", "2026-06-11"],
    ["SINARBERKAH - TT - Juni - Video + Quotes 1", "2026-06-09"],
    ["SINARBERKAH - IG - Juni - Video + Quotes 2", "2026-06-10"],
    ["SINARBERKAH - IG - Juni - Ceritain Makanan dan Tempatnya", "2026-06-10"],
    ["SINARBERKAH - IGS - Juni - OPEN (15)", "2026-06-10"],
    ["SINARBERKAH - IGS - Juni - TUTUP (15)", "2026-06-08"],
    ["SINARBERKAH - IGS - Juni - INTERAKSI (8)", "2026-06-10"],
    ["SINARBERKAH - TT - Juni - Kasir dan segala aktivitasnya", "2026-06-12"],
    ["SINARBERKAH - TT - Juni - Ceritain Makanan + Angle Detail", "2026-06-13"],
    ["SINARBERKAH - TT - Juni - Pramusaji dan segala aktivitasnya", "2026-06-12"],
    ["SINARBERKAH - TT - Juni - Penjaga Warung Manis dan segala aktivitasnya", "2026-06-13"],
    ["SINARBERKAH - TT - Juni - Wawancara dengan pengunjung", "2026-06-12"],
    ["SINARBERKAH - IGS - Juni - VIDEO + QUOTES BAHAGIA (15)", "2026-06-13"],
  ],
  GWESHA: [
    ['GWESHA - Video Content IG & TT - April - VIDEO PEGANG #5 — "Yang Bikin Daster Gwesha Beda dari Daster Pasar"', "2026-05-23"],
    ['GWESHA - Video Content IG & TT - April - VIDEO PEGANG #4 — "5 Motif Favorit Customer Gwesha"', "2026-05-18"],
    ['GWESHA - Video Content IG & TT - April - TRY-ON #5 — "1 Daster, 5 Mood Pose Beda"', "2026-05-23"],
    ['GWESHA - Single/Caroussel Post IG & TT - April - Konten 6 - "Daster Gwesha — Kenapa Rp99rb Worth It"', "2026-05-21"],
    ['GWESHA Single/Caroussel Post IG & TT - April - Konten 7 - "5 Motif Daster Gwesha & Mood-nya Masing-masing"', "2026-05-22"],
    ['GWESHA - Video Content IG & TT - April - TRY-ON #2 — "Try-On 3 Motif Favorit"', "2026-05-18"],
    ['GWESHA - Video Content IG & TT - April - TRY-ON #4 — "All Size fit to XL — Cek Body Type"', "2026-05-21"],
    ['GWESHA - Video Content IG & TT - April - TRY-ON #1 — "Vesha vs Kesha — Try On Comparison"', "2026-05-09"],
    ['GWESHA - Video Content IG & TT - April - VIDEO PEGANG #3 — "Tes Bahan: Diteteskan Air"', "2026-05-18"],
    ['GWESHA - Single/Caroussel Post IG & TT - April - Konten 5 - "POV: Kamu di WA-grup Keluarga"', "2026-05-20"],
    ["GWESHA - Single/Caroussel Post IG & TT - April - Konten 2 - [PERBEDAAN] Vesha & Kesha · Flower Chain Navy", "2026-05-11"],
    ['GWESHA - Video Content IG & TT - April - VIDEO PEGANG #1 — "Pegang dulu, baru kamu ngerti"', "2026-05-07"],
    ["GWESHA - Single/Caroussel Post IG & TT - April - Konten 1 - Vesha · Sage Vintage Bloom", "2026-05-11"],
    ['GWESHA - Single/Caroussel Post IG & TT - April - Konten 4 - "Kenapa Daster Rayon Viscose Lebih Worth It"', "2026-05-16"],
    ['GWESHA - Video Content IG & TT - April - TRY-ON #6 — "Try On 4 Warna Onyx Broque Stripe — Mana Skin Tone Kamu?"', "2026-05-26"],
    ['GWESHA - Video Content IG & TT - April - VIDEO PEGANG #2 — "Kenapa Rp99rb Itu Murah Banget Buat Bahan Ini"', "2026-05-18"],
    ['GWESHA - Single/Caroussel Post IG & TT - April - Konten 3 - "5 Tanda Kamu Butuh Daster Baru"', "2026-05-12"],
    ["GWESHA - Video Content IG & TT - April - Dance 2", "2026-05-04"],
    ["GWESHA - Video Content IG & TT - April - Dance 1", "2026-05-04"],
    ["GWESHA - Video Content IG & TT - April - Flat Lay 3", "2026-05-04"],
    ["GWESHA - Video Content IG & TT - April - Dance 4", "2026-05-04"],
    ["GWESHA - Video Content IG & TT - April - Flat Lay 1", "2026-05-13"],
    ["GWESHA - Video Content IG & TT - April - Dance 3", "2026-05-06"],
  ],
};

type Status = "not_started" | "in_progress" | "done" | "ready" | "scheduled" | "published";
type TypeContent = "carousel" | "reels" | null;

function inferType(title: string): TypeContent {
  const t = title.toLowerCase();
  if (/reels|video|dance|try-on|pegang|flat lay/.test(t)) return "reels";
  if (/slide|carou|single|post|konten|poster/.test(t)) return "carousel";
  return null;
}

function inferStatus(title: string, date: string): Status {
  const t = title.toLowerCase();
  if (/setup|profile|deck|offering pdf|\[design\]/.test(t)) return "done";
  // Past months (before June 2026) are historical → published. June → in progress.
  const month = Number(date.slice(5, 7));
  if (month < 6) return "published";
  return "in_progress";
}

async function main() {
  const clients = await db.select({ id: client.id, name: client.name }).from(client);
  const byName = new Map(clients.map((c) => [c.name, c.id]));

  let inserted = 0;
  let skipped = 0;
  for (const [clientName, rows] of Object.entries(DATA)) {
    const clientId = byName.get(clientName);
    if (!clientId) {
      console.warn(`Client not found: ${clientName}`);
      continue;
    }
    for (const [title, date] of rows) {
      const [existing] = await db
        .select({ id: task.id })
        .from(task)
        .where(and(eq(task.title, title), eq(task.clientId, clientId)))
        .limit(1);
      if (existing) {
        skipped++;
        continue;
      }
      await db.insert(task).values({
        title,
        clientId,
        status: inferStatus(title, date),
        typeContent: inferType(title),
        postingDate: date,
      });
      inserted++;
    }
  }
  console.log(`Migrasi task selesai. Inserted ${inserted}, skipped ${skipped}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
