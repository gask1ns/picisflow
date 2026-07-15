import type { Context } from "grammy";

export async function handleHelp(ctx: Context) {
  await ctx.reply(
    "🤖 *PicisFlow Bot*\n\n" +
    "Catat transaksi langsung dari chat, tanpa buka app.\n\n" +
    "*Perintah:*\n" +
    "`/start <kode>` — Hubungkan akun Telegram dari web\n" +
    "`/catat` — Buka keyboard pilih kategori, kirim nominal\n" +
    "`/batal [n]` — Hapus transaksi (contoh: `/batal 3`, `/batal all`)\n" +
    "`/list [filter]` — Lihat transaksi (`/list 7`, `/list makanan`, `/list bulan ini`)\n" +
    "`/stats` — Laporan pemasukan/pengeluaran bulan ini\n" +
    "`/nabung` — Nabung ke target tabungan\n" +
    "`/nabung <nama> <jumlah>` — Buat target baru sekaligus\n" +
    "`/export` — Export transaksi ke CSV\n" +
    "`/help` — Tampilkan ini\n\n" +
    "*Contoh catat langsung:*\n" +
    "`kopi 15000` — auto-detek kategori Makanan\n" +
    "`bensin 50000` — Transport\n" +
    "`gaji 5juta` — Pemasukan\n\n" +
    "*Format nominal:*\n" +
    "`500ribu` / `500rb` — 500.000\n" +
    "`1juta` / `1jt` — 1.000.000\n" +
    "`2.5juta` — 2.500.000\n" +
    "`1.500.000` — 1.500.000\n" +
    "`2juta500` — 2.000.500\n\n" +
    "*Tips:*\n" +
    "Kategori auto-detect dari ribuan alias. Budget alert otomatis kalo udah mepet. Belum tau kategori? Pake `/catat` pilih dari keyboard.",
    { parse_mode: "Markdown" as const }
  );
}
