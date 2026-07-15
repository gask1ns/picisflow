# PicisFlow — Instruksi Agent

## Stack
- **Framework:** Next.js (App Router) — frontend + API routes
- **UI:** Tailwind CSS + RetroUI (neobrutalism: border hitam 2-4px, hard shadow, tanpa blur, kontras tinggi) + framer-motion
- **DB/Auth:** Supabase Postgres + Supabase Auth (RLS di semua tabel)
- **Bot:** Telegram Bot API via `grammy` (webhook, BUKAN polling)
- **Hosting:** Vercel Hobby (gratis) + Supabase Free (auto-pause setelah 7 hari idle)
- **PWA:** Manifest + SVG icons + display standalone
- **Budget:** Rp0 — tidak boleh pakai layanan berbayar pihak ketiga

## Perintah Dasar
```bash
npm run dev          # jalankan dev server Next.js
npm run build        # build production
npm run lint         # cek lint
npx eslint src/      # lint dengan warnings
npx supabase gen types --lang typescript --local > src/lib/supabase/database.types.ts
# ^ regenerasi type setelah perubahan skema
```

## Aturan Arsitektur
- **Satu DB** dipakai bersama web + bot Telegram — tidak ada layer sinkronisasi.
- **Bot Telegram = webhook** ke Next.js Route Handler di `/api/telegram/webhook`. Jangan pernah pakai polling (tidak cocok serverless).
- **Vercel Cron** (max 1x/hari di Hobby): satu cron route `/api/cron/daily` cek recurring + laporan terjadwal + reminder 48 jam idle.
- **NL parsing:** pattern matching (regex), jangan LLM. Format: `<kategori> <jumlah> [catatan]`. Support `1rb`, `500ribu`, `1juta`, `1.5juta`, `2juta500`, `1.500.000`.
- **Auto-detect kategori:** tokenize + scoring dari field `aliases[]` di tabel categories. 500+ alias default.
- **Bahasa bot:** Indonesia, nada santai.

## Konvensi Database
- Semua tabel wajib punya RLS policy dengan `auth.uid()`.
- `telegram_links` memetakan `user_id ↔ telegram_chat_id` + status verifikasi.
- `transactions` punya kolom `source` (`web` | `telegram`).
- `categories`: seed default + baris custom per user (`user_id` nullable untuk global default). Punya kolom `aliases text[]` + `monthly_budget numeric` untuk budget alert.
- `pending_sessions` untuk state inline keyboard flow bot.

## Fitur yang Udah Dibangun
- **Dashboard:** Stat cards, bar chart kategori, progress bar budget, 5 transaksi terbaru, HoverCard motion
- **Transaksi:** CRUD + filter kategori/tanggal + modal konfirmasi hapus
- **Kategori:** List + set budget per kategori
- **Goals:** CRUD + progress bar + top-up saldo
- **Debts:** List hutang/piutang + ringkasan total
- **Recurring:** CRUD + toggle aktif/nonaktif
- **Telegram Bot (6 commands):**
  - `/start <kode>` — Link akun web
  - `/catat` — Inline keyboard pilih kategori, kirim nominal
  - `/batal [n/all]` — Hapus 1/n/all transaksi terakhir
  - `/list [filter]` — Transaksi hari ini / 7 / 30 / kategori / bulan ini
  - `/stats` — Laporan bulan ini
  - `/help` — Bantuan lengkap
- **Bot otomatis:** Budget alert, edit/hapus inline, reminder 48 jam idle

## Alur Kerja Developer
1. Ubah skema → buat migrasi Supabase → jalanin di SQL Editor → regenerasi type opsional.
2. Set `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_BOT_SECRET_TOKEN` di `.env.local`.
3. Daftarkan webhook:
   ```bash
   curl -F "url=https://<url>/api/telegram/webhook" \
        -F "secret_token=<TELEGRAM_BOT_SECRET_TOKEN>" \
        https://api.telegram.org/bot<TOKEN>/setWebhook
   ```
4. Vercel Cron: tambah key `crons` di `vercel.json` untuk `/api/cron/daily`.

## Constraint Penting
- Supabase Free auto-pause setelah 7 hari tanpa aktivitas. Bangunkan dengan hit API route mana pun.
- Vercel Hobby: max 1 cron job, 1x/hari. Semua logika terjadwal (recurring, laporan, reminder) muat dalam satu route `/api/cron/daily`.
- Batas panjang pesan Telegram: 4096 karakter. Laporan panjang harus di-paginate.
- Tidak boleh pakai analytics eksternal, error tracking berbayar, atau service berbayar lain — jaga tetap gratis.
