# Progress PicisFlow — 15 Juli 2026

## Phase 1: Foundation ✅
| Item | Status |
|---|---|
| Next.js 16 + Tailwind v4 + TypeScript | ✅ |
| Supabase SSR (client, server, middleware) | ✅ |
| 7 tables (profiles, telegram_links, categories, transactions, recurring, goals, debts) + pending_sessions + notifications + processed_updates + export_tokens | ✅ |
| RLS policies + triggers + auto-profile-on-signup | ✅ |
| Seed: 12 default categories with 500+ aliases | ✅ |
| framer-motion | ✅ |
| PWA: manifest + SVG icons + standalone | ✅ |
| Skeleton component (ui/skeleton) | ✅ |
| Error boundary (error.tsx) | ✅ |
| Loading states (loading.tsx) for dashboard, transactions, goals, debts | ✅ |

## Phase 2: Web App ✅
| Feature | Status |
|---|---|
| Auth: login, register, magic link, logout, forgot password, callback | ✅ |
| Dashboard: stat cards, bar chart, budget progress, 5 recent transactions | ✅ |
| Transactions: CRUD, filter (kategori/tanggal), pagination (25/page), export CSV | ✅ |
| Categories: list with budget set modal | ✅ |
| Goals: CRUD, progress bar, top-up modal | ✅ |
| Debts: CRUD, summary cards, toggle paid | ✅ |
| Recurring: CRUD, toggle active/inactive | ✅ |
| Settings: edit profile name, delete account, Telegram link status + copy code | ✅ |
| Admin panel: /admin — stats, broadcast notification (to web + Telegram) | ✅ |
| Notification center (bell icon): budget alert, recurring, debt due, welcome | ✅ |
| Telegram real-time watcher (Realtime + polling) | ✅ |
| Telegram unlinked banner + sidebar dot indicator | ✅ |
| RetroUI theme (cream bg, yellow primary, Archivo Black + Space Grotesk) | ✅ |
| Responsive: sidebar desktop, sheet mobile, bottom nav | ✅ |
| Accessible: form labels, forgot password flow | ✅ |

## Phase 3: Telegram Bot ✅
| Feature | Status |
|---|---|
| Webhook route, 8 commands | ✅ |
| `/start <kode>` — Link akun web | ✅ |
| `/catat` — Inline keyboard + tokenize scoring + budget alert | ✅ |
| `/batal [n/all]` — Delete last n/all transactions | ✅ |
| `/list [filter]` — Today / 7d / 30d / category / this month | ✅ |
| `/stats` — Monthly report | ✅ |
| `/nabung` — Savings goals (create, select, top-up) | ✅ |
| `/export` — Export CSV (today / 7d / 30d / this month) via link | ✅ |
| `/help` — Full help | ✅ |
| SMS/EWallet regex parser (BCA, Mandiri, BNI, BRI, GoPay, OVO, DANA, ShopeePay) | ✅ |
| Budget alert otomatis | ✅ |
| Reminder 48h idle (cron) | ✅ |
| Edit transaction inline (jumlah) | ✅ |
| Notification triggers (budget ≥80%, goal completion, debt due) | ✅ |

## Phase 4: Infrastructure ✅
| Item | Status |
|---|---|
| Vercel-ready: next build passes, .env.example, vercel.json | ✅ |
| Cron: /api/cron/daily (recurring, reports, reminder, goal check, debt due) | ✅ |
| Webhook idempotency (processed_updates table) | ✅ |
| WIB timezone (Asia/Jakarta) | ✅ |
| CRON_SECRET auth | ✅ |

## Bot Commands
| Command | Description |
|---|---|
| `/start <kode>` | Link akun web ke Telegram |
| `/catat` | Inline keyboard pilih kategori, kirim nominal |
| `/batal [n/all]` | Hapus 1/n/all transaksi terakhir |
| `/list [filter]` | Transaksi hari ini / 7 / 30 / kategori / bulan ini |
| `/stats` | Laporan pemasukan/pengeluaran bulan ini |
| `/nabung` | Nabung ke target tabungan |
| `/export` | Export transaksi ke CSV |
| `/help` | Bantuan |

## File Structure
```
src/
├── app/
│   ├── (auth)/           — login, register, callback, forgot-password, verify-email
│   ├── (dashboard)/
│   │   ├── dashboard/    — page + client
│   │   ├── transactions/ — list, new, [id], client, recurring/
│   │   ├── categories/   — page + client
│   │   ├── goals/        — page + client
│   │   ├── debts/        — page + client
│   │   ├── settings/     — page + client
│   │   ├── loading.tsx
│   │   └── layout.tsx
│   ├── admin/            — page + client
│   ├── api/
│   │   ├── admin/        — broadcast, stats
│   │   ├── auth/         — telegram-session
│   │   ├── notifications/ — GET, read-all, [id]/read
│   │   ├── transactions/export
│   │   ├── telegram/webhook
│   │   └── cron/daily
│   ├── loading.tsx
│   ├── error.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── manifest.ts
│   └── middleware.ts
├── components/
│   ├── layout/           — bottom-nav
│   ├── ui/               — modal, skeleton, sidebar, sheet, tooltip, sonner, button, badge, input, separator
│   ├── motion/           — page-wrapper, stagger, fade-in, hover-card
│   ├── charts/           — bar-chart
│   ├── telegram/         — link-status
│   ├── transactions/     — transaction-form
│   ├── app-sidebar.tsx
│   ├── dashboard-header.tsx
│   ├── notification-center.tsx
│   ├── telegram-link-banner.tsx
│   └── telegram-link-watcher.tsx
├── lib/
│   ├── supabase/         — client, server, middleware, actions
│   ├── telegram/         — bot, parser, regexParser, session, wib, link-context, commands/
│   ├── debts/actions.ts
│   ├── transactions/actions.ts
│   ├── categories/actions.ts
│   ├── savings/actions.ts
│   ├── recurring/actions.ts
│   └── utils.ts
└── hooks/                — use-mobile, useSound
```
