# Setup Guide — PicisFlow

## Step 1: Buat Bot Telegram

1. Buka Telegram, cari [@BotFather](https://t.me/BotFather)
2. Kirim `/newbot`
3. Ikuti instruksi:
   - **Nama bot:** `PicisFlow` (atau terserah)
   - **Username bot:** `picisflow_bot` (harus unik, diakhiri `_bot`)
4. Selesai → BotFather kasih **token**. Simpen token ini.

5. Buka `.env.local` di project, isi:
   ```
   TELEGRAM_BOT_TOKEN=7428391:AAH...token_dari_botfather
   TELEGRAM_BOT_SECRET_TOKEN=picisflow-secret-abc123
   ```
   > `BOT_SECRET_TOKEN` bebas lo buat sendiri — dipake validasi webhook.

---

## Step 2: Setup Auth di Supabase Dashboard

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)— pilih project kamu
2. **Authentication → Providers → Email**
   - Pastikan **Enabled** ON
   - **Confirm email** → OFF (buat dev, biar daftar langsung tanpa verifikasi)
3. **Authentication → URL Configuration**
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** tambahin `http://localhost:3000/callback`

---

## Step 3: Jalankan Dev Server

```bash
npm run dev
```

Buka `http://localhost:3000`

- Klik **Daftar**, buat akun pake email + password
- Klik **Masuk**, login
- Kalo berhasil, masuk ke Dashboard

---

## Step 4: Daftarkan Webhook Bot Telegram

Bot Telegram butuh endpoint publik. Ada 2 cara:

### Cara A — Deploy ke Vercel dulu (recommended)

```bash
# Install Vercel CLI
npx vercel

# Ikuti wizard:
# - Login / Signup
# - Link existing project / buat baru
# - Biarin default settings

# Set env vars di Vercel
npx vercel env add TELEGRAM_BOT_TOKEN
npx vercel env add TELEGRAM_BOT_SECRET_TOKEN
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
npx vercel --prod

# Dapetin URL: https://picisflow.vercel.app
```

Setelah deploy, daftarin webhook:

```bash
curl -F "url=https://<vercel-url>/api/telegram/webhook" \
     -F "secret_token=picisflow-secret-abc123" \
     https://api.telegram.org/bot<TOKEN>/setWebhook
```

Contoh:
```bash
curl -F "url=https://picisflow.vercel.app/api/telegram/webhook" \
     -F "secret_token=<BOT_SECRET_TOKEN>" \
     https://api.telegram.org/bot<TOKEN>/setWebhook
```

Response: `{"ok": true, "description": "Webhook was set"}` ✅

### Cara B — Pakai tunnel (localhost testing)

Gunakan [ngrok](https://ngrok.com/) atau [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/):

```bash
# Install ngrok, lalu:
ngrok http 3000
# Dapetin URL: https://abc123.ngrok-free.app
```

Daftarin webhook:
```bash
curl -F "url=https://abc123.ngrok-free.app/api/telegram/webhook" \
     -F "secret_token=picisflow-secret-abc123" \
     https://api.telegram.org/bot<TOKEN>/setWebhook
```

**Setelah webhook terdaftar, `npm run dev` harus jalan** biar ngrok bisa forward ke localhost.

---

## Step 5: Verifikasi Bot

1. Buka Telegram, cari bot lo (`@picisflow_bot`)
2. Kirim `/start` → bot harus balas pesan sambutan
3. Kirim `/help` → bot tampilin daftar perintah

---

## Step 6: Link Akun Web ↔ Telegram

1. Buka `http://localhost:3000/settings` (atau URL Vercel)
2. Lihat bagian **Telegram** — belum terhubung
3. (Fitur ini belum diimplementasi penuh di halaman settings, tapi secara teknis bisa via DB)

**Cara manual link (buat testing):**
Buka Supabase Dashboard → **SQL Editor**, jalanin:

```sql
-- Ganti chat_id dengan chat_id lo (dapet dari bot /start)
INSERT INTO public.telegram_links (user_id, telegram_chat_id, is_verified)
SELECT id, <chat_id>, true
FROM auth.users
WHERE email = 'email_lo@example.com'
ON CONFLICT (user_id) DO UPDATE
SET telegram_chat_id = EXCLUDED.telegram_chat_id,
    is_verified = true;
```

> Cara dapet `chat_id`: kirim pesan ke bot, cek logs webhook, atau pake bot `@userinfobot`.

---

## Step 7: Test Catat Transaksi via Bot

Kirim ke bot:

```
jajan 15000 kopi
```

Atau:

```
/catat gaji 5000000
```

Bot harus balas konfirmasi. Cek di web Dashboard → Transaksi, harus muncul.

---

## Step 8: Test Undo

```
/batal
```

Hapus transaksi terakhir.

---

## Step 9: Deploy ke Vercel (final)

```bash
npx vercel --prod
```

Setelah domain Vercel fix, update webhook Telegram:

```bash
curl -F "url=https://picisflow.vercel.app/api/telegram/webhook" \
     -F "secret_token=picisflow-secret-abc123" \
     https://api.telegram.org/bot<TOKEN>/setWebhook
```

---

## Troubleshooting

### Webhook error: "404 Not Found"
- Pastikan route `app/api/telegram/webhook/route.ts` ada
- Deploy ulang
- Cek `POST` method aja, `GET` gak dihandle

### Bot gak respon
- Cek `TELEGRAM_BOT_TOKEN` di env
- Cek webhook status: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Pastikan tidak ada error di terminal dev server

### Auth error: "Email not confirmed"
- Di Supabase Dashboard matiin **Confirm email** di Authentication → Providers → Email
- Atau konfirmasi manual di Authentication → Users → pilih user → Confirm

### Profile not created
- Trigger `on_auth_user_created` harus jalan waktu signup
- Cek: SQL Editor → `SELECT * FROM public.profiles;`
- Kalo kosong, jalanin manual:
  ```sql
  INSERT INTO public.profiles (id)
  SELECT id FROM auth.users
  WHERE id NOT IN (SELECT id FROM public.profiles);
  ```
