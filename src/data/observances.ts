/**
 * Hari penting NON-LIBUR yang relevan untuk konten/story (ucapan, campaign).
 *
 * API libur nasional hanya memuat tanggal merah + cuti bersama — momen konten
 * di bawah ini TIDAK ada di sana, padahal sering jadi bahan story (Kartini,
 * Ibu, Sumpah Pemuda, dll). Tanggal Gregorian-nya FIXED tiap tahun, jadi aman
 * di-hardcode sekali (tak perlu maintenance). Hari raya yang tanggalnya geser
 * (Idul Fitri, 1 Muharam, dst) datang dari sumber libur dinamis, bukan sini.
 *
 * Format `md`: "MM-DD".
 */
export const OBSERVANCES: { md: string; name: string }[] = [
  { md: "01-10", name: "Hari Gerakan Satu Juta Pohon" },
  { md: "02-09", name: "Hari Pers Nasional" },
  { md: "02-14", name: "Hari Valentine" },
  { md: "03-08", name: "Hari Perempuan Internasional" },
  { md: "04-21", name: "Hari Kartini" },
  { md: "04-22", name: "Hari Bumi" },
  { md: "05-02", name: "Hari Pendidikan Nasional" },
  { md: "05-20", name: "Hari Kebangkitan Nasional" },
  { md: "06-05", name: "Hari Lingkungan Hidup Sedunia" },
  { md: "07-23", name: "Hari Anak Nasional" },
  { md: "08-12", name: "Hari Remaja Internasional" },
  { md: "09-04", name: "Hari Pelanggan Nasional" },
  { md: "10-01", name: "Hari Kesaktian Pancasila" },
  { md: "10-02", name: "Hari Batik Nasional" },
  { md: "10-28", name: "Hari Sumpah Pemuda" },
  { md: "11-10", name: "Hari Pahlawan" },
  { md: "11-25", name: "Hari Guru Nasional" },
  { md: "12-22", name: "Hari Ibu" },
];
