# PicisFlow 📊

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-26A5E4)](https://core.telegram.org/bots)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000)](https://vercel.com/)

**Catat keuangan harian lewat Web + Telegram Bot.** Personal finance tracker buat mahasiswa & pekerja Indonesia. Zero budget hosting (Vercel Hobby + Supabase Free).

---

## ✨ Fitur

- **Dashboard** — Stat cards, tren harian (chart), budget progress, transaksi terbaru
- **Transaksi** — CRUD, filter kategori/tanggal, pagination, export CSV
- **Budget** — Set budget per kategori (mingguan/bulanan), alert ≥80%, shake animation
- **Kategori** — 12 default + custom, auto-detect via 500+ aliases
- **Target** — Savings goals, progress bar, top-up saldo
- **Hutang** — List hutang/piutang + ringkasan total
- **Recurring** — Transaksi berulang, toggle aktif/nonaktif
- **Telegram Bot** — 8 commands: `/catat`, `/batal`, `/list`, `/stats`, `/nabung`, `/export`, `/start`, `/help`
- **Notifikasi** — Budget alert, goal completion, welcome notification
- **RetroUI** — Desain neobrutalism: border tebal, hard shadow, Archivo Black + Space Grotesk

---

## 🛠 Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | Tailwind CSS v4 + RetroUI + framer-motion |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (magic link + password) |
| Bot | Telegram Bot API via Grammy (webhook) |
| Chart | Recharts |
| Hosting | Vercel Hobby + Supabase Free |

---

## 🚀 Cara Mulai

### 1. Clone & Install

```bash
git clone https://github.com/iqbalpa/picisflow.git
cd picisflow
npm install
```

### 2. Setup Supabase

1. Buat project di [Supabase](https://supabase.com/)
2. Copy `.env.example` → `.env.local`, isi dengan credentials dari Supabase Dashboard
3. Jalankan semua file SQL di `supabase/migrations/` di Supabase SQL Editor
4. Jalankan seed data di `supabase/seed/01_default_categories.sql`

### 3. Setup Telegram Bot

1. Buat bot via [@BotFather](https://t.me/BotFather)
2. Isi `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_BOT_SECRET_TOKEN` di `.env.local`
3. Setelah deploy, daftarin webhook:

```bash
curl -F "url=https://<url-kamu>/api/telegram/webhook" \
     -F "secret_token=<TELEGRAM_BOT_SECRET_TOKEN>" \
     https://api.telegram.org/bot<TOKEN>/setWebhook
```

### 4. Jalankan

```bash
npm run dev
```

---

## 🤖 Bot Commands

| Command | Fungsi |
|---------|--------|
| `/start <kode>` | Link akun web dengan Telegram |
| `/catat` | Inline keyboard pilih kategori → kirim nominal |
| `/batal [n/all]` | Hapus 1/n/all transaksi terakhir |
| `/list [filter]` | Lihat transaksi (hari ini / 7 / 30 / kategori) |
| `/stats` | Laporan keuangan bulan ini |
| `/nabung` | Kelola target tabungan |
| `/export` | Download CSV transaksi |
| `/help` | Bantuan lengkap |

---

## 📁 Struktur

```
src/
├── app/
│   ├── (auth)/          # Login, register, forgot password
│   ├── (dashboard)/     # Dashboard, transaksi, kategori, goals, debts, settings
│   ├── admin/           # Panel admin
│   └── api/             # Route handlers (webhook, cron, export, notif)
├── components/
│   ├── charts/          # Bar chart, trend chart, budget overview
│   ├── layout/          # Bottom nav
│   ├── motion/          # Animation wrappers
│   └── ui/              # RetroUI components
├── lib/
│   ├── categories/      # Server actions
│   ├── debts/
│   ├── goals/
│   ├── supabase/        # Client, server, middleware, types
│   ├── telegram/        # Bot commands, parser, regex, session
│   └── transactions/
└── hooks/
supabase/
├── migrations/          # 12 migration files
└── seed/                # Default categories seed
```

---

## 📝 Lisensi

MIT © 2026 [iqbalpa](https://github.com/iqbalpa)

---

**Dibuat dengan 💛 untuk komunitas Indonesia.**
