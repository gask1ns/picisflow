# PRD — PicisFlow

**Personal Finance Tracker dengan Integrasi Telegram Bot**

Versi: 1.0 (Final) — 14 Juli 2026

---

## 1. Ringkasan Produk

PicisFlow adalah aplikasi web pencatat keuangan pribadi yang bisa diakses lewat **webapp** maupun **bot Telegram**. Tujuannya membuat pencatatan transaksi sehari-hari secepat mungkin (< 10 detik per transaksi), dengan laporan dan insight yang jelas di dashboard web.

**Nama:** PicisFlow (dari "picis" — recehan/uang kecil dalam bahasa Indonesia).

**Target:** Mahasiswa dan pekerja muda (18–30) di Indonesia.

---

## 2. Masalah

| Masalah | Dampak |
|---|---|
| Finance tracker kebanyakan rumit dipakai harian | User berhenti mencatat beberapa hari |
| Buka app khusus tiap catat pengeluaran = effort tambahan | Pencatatan tidak konsisten |
| Tidak ada gambaran jelas ke mana uang habis tiap bulan | Sulit buat keputusan finansial |
| Banyak finance tracker berbayar | Barrier buat mahasiswa/pekerja budget terbatas |

**Insight:** Telegram sudah jadi app harian target user. Bot Telegram = catat transaksi dalam 1 chat tanpa buka app lain. Webapp untuk laporan, grafik, pengaturan detail.

---

## 3. Goals

1. User catat transaksi (income/expense) dalam < 10 detik via Telegram.
2. Dashboard web menunjukkan kondisi keuangan secara jelas.
3. Sistem jalan dengan **budget operasional Rp0** (full free tier).
4. Arsitektur simple, mudah di-maintain 1 developer.

### Non-Goals (v1)

- Bukan aplikasi investasi/trading.
- Bukan kolaboratif multi-user dalam satu akun.
- Bukan OCR resi otomatis.
- Tidak menargetkan enterprise/bisnis.

---

## 4. Persona

**Dinda — Mahasiswa Semester 5**
- Uang saku terbatas, sering habis sebelum akhir bulan.
- Ingin tahu kategori mana paling banyak menghabiskan uang.
- Telegram selalu aktif buat grup tugas.

**Rian — Pekerja Junior**
- Gaji tetap, ingin mulai menabung dan lunasi cicilan.
- Ingin laporan mingguan/bulanan otomatis.
- Butuh progress tabungan (goal-based saving).

---

## 5. Fitur v1

### 5.1 Wajib (Must Have)

| # | Fitur | Deskripsi |
|---|---|---|
| F1 | Autentikasi | Email/password + magic link (Supabase Auth). Link akun web ke Telegram via kode verifikasi. |
| F2 | Catat transaksi (Web) | Form tambah income/expense: jumlah, kategori, tanggal, catatan. |
| F3 | Catat transaksi (Telegram) | Chat bot: pesan natural (`jajan 15000 kopi`) atau inline keyboard → parsing → simpan ke DB. |
| F4 | Kategori | Default (Makanan, Transport, Hiburan, dll) + custom per user. |
| F5 | Dashboard | Total income/expense bulan berjalan, saldo, breakdown kategori (chart). |
| F6 | Riwayat | List transaksi + filter tanggal/kategori, edit/hapus. |
| F7 | Undo | Command `/batal` di Telegram — hapus transaksi terakhir. |

### 5.2 Prioritas Tinggi (Should Have — masuk v1 jika waktu cukup)

| # | Fitur | Deskripsi |
|---|---|---|
| F8 | Recurring | Transaksi otomatis rutin (misal bayar kos tiap tanggal 1). |
| F9 | Laporan terjadwal | Bot kirim ringkasan mingguan/bulanan otomatis ke Telegram. |
| F10 | Savings goals | Set target nominal + deadline, progress bar di dashboard. |
| F11 | Hutang/piutang | Catat counterparty, jumlah, status lunas. |

### 5.3 Out of Scope v1

OCR struk, multi-currency, shared wallet, integrasi bank/e-wallet.

---

## 6. Arsitektur & Tech Stack

### 6.1 Prinsip

- **Single source of truth:** Satu Supabase Postgres dipakai web + bot — tanpa sinkronisasi.
- **Serverless-first:** Semua komponen jalan di free tier.
- **Webhook, bukan polling:** Bot Telegram webhook ke Vercel API Route.

### 6.2 Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Frontend | Next.js (App Router) | Hosting Vercel Hobby (gratis) |
| Styling | Tailwind CSS + RetroUI | Neobrutalism: border hitam 2-4px, hard shadow, kontras tinggi |
| Backend/API | Next.js Route Handlers | Juga endpoint webhook Telegram |
| Database | Supabase Postgres | Free tier (500MB) |
| Auth | Supabase Auth | Email/password + magic link |
| Bot | Telegram Bot API + `grammy` | Webhook di Next.js Route Handler |
| Scheduled | Vercel Cron Jobs | 1x/hari, Hobby plan |
| Hosting | Vercel | Free tier |

### 6.3 Constraint Rp0

- Vercel Hobby: cron max 1x/hari → laporan mingguan/bulanan dicek via 1 cron harian.
- Supabase Free: auto-pause >7 hari idle.
- Tidak pakai layanan berbayar pihak ketiga.

### 6.4 Diagram Alur

```
[Browser] ---> [Next.js Frontend] ---> [Supabase (Auth + DB)]
                                              ^
[Telegram] ---> [Bot API] ---> [Next.js Webhook] ---> [Supabase (DB)]

[Vercel Cron] ---> [Route: cek recurring + laporan] ---> [Supabase] + [Bot API]
```

---

## 7. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| Rata-rata input transaksi via Telegram | < 10 detik |
| Retensi pencatatan (≥3x/minggu) | Meningkat dibanding tanpa bot |
| Error sinkronisasi web ↔ Telegram | 0 (satu DB) |
| Biaya operasional bulanan | Rp0 |

---

## 8. Roadmap

- **v1:** F1–F7 (wajib) + sebanyak mungkin F8–F11.
- **v1.1:** Sisa F8–F11.
- **v2 (future):** OCR resi, multi-currency, shared wallet.
