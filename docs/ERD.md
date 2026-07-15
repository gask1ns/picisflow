# ERD — PicisFlow

## Diagram (Mermaid)

```mermaid
erDiagram
    auth_users ||--o| profiles : extends
    auth_users ||--o| telegram_links : has
    auth_users ||--o| categories : "has custom"
    auth_users ||--o| transactions : owns
    auth_users ||--o| recurring_transactions : owns
    auth_users ||--o| savings_goals : owns
    auth_users ||--o| debts : owns
    categories ||--o{ transactions : classifies
    categories ||--o{ recurring_transactions : "templates"

    auth_users {
        uuid id PK
        text email
        timestamptz created_at
    }

    profiles {
        uuid id PK, FK
        text display_name
        text currency "default IDR"
        timestamptz created_at
        timestamptz updated_at
    }

    telegram_links {
        uuid id PK
        uuid user_id FK, UK
        bigint telegram_chat_id UK, nullable
        text telegram_username nullable
        text verification_code nullable
        timestamptz verification_code_expires_at nullable
        bool is_verified "default false"
        timestamptz created_at
        timestamptz updated_at
    }

    categories {
        uuid id PK
        uuid user_id FK, nullable "null = global default"
        text name "e.g. Makanan"
        text type "income | expense"
        text icon nullable
        text color nullable
        bool is_default "default false"
        timestamptz created_at
    }

    transactions {
        uuid id PK
        uuid user_id FK
        uuid category_id FK, nullable
        text type "income | expense"
        numeric amount "CHECK > 0"
        text description nullable
        date date
        text source "web | telegram"
        timestamptz created_at
        timestamptz updated_at
    }

    recurring_transactions {
        uuid id PK
        uuid user_id FK
        uuid category_id FK, nullable
        text type "income | expense"
        numeric amount "CHECK > 0"
        text description nullable
        text frequency "daily | weekly | monthly | yearly"
        int interval_value "default 1"
        int day_of_month nullable
        int day_of_week nullable
        date start_date
        date end_date nullable
        date last_generated_date nullable
        bool is_active "default true"
        timestamptz created_at
        timestamptz updated_at
    }

    savings_goals {
        uuid id PK
        uuid user_id FK
        text name
        numeric target_amount "CHECK > 0"
        numeric current_amount "default 0"
        date deadline nullable
        uuid category_id FK, nullable
        bool is_completed "default false"
        timestamptz created_at
        timestamptz updated_at
    }

    debts {
        uuid id PK
        uuid user_id FK
        text counterparty_name
        text type "owe | owed"
        numeric amount "CHECK > 0"
        text description nullable
        date due_date nullable
        bool is_paid "default false"
        timestamptz created_at
        timestamptz updated_at
    }
```

---

## Spesifikasi Tabel

### auth.users (Supabase managed)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Dikelola Supabase Auth |
| email | text | |
| created_at | timestamptz | |

> Jangan modifikasi langsung. Hubungkan via FK dari `profiles.id`.

### profiles

| Kolom | Tipe | Constraint | Default |
|---|---|---|---|
| id | uuid PK, FK → auth.users.id | ON DELETE CASCADE | |
| display_name | text | nullable | null |
| currency | text | | 'IDR' |
| created_at | timestamptz | | now() |
| updated_at | timestamptz | | now() |

**Trigger:** `updated_at` otomatis. **RLS:** `auth.uid() = id`.

### telegram_links

| Kolom | Tipe | Constraint | Default |
|---|---|---|---|
| id | uuid PK | | gen_random_uuid() |
| user_id | uuid FK → auth.users.id | UNIQUE, NOT NULL, ON DELETE CASCADE | |
| telegram_chat_id | bigint | UNIQUE, nullable | null |
| telegram_username | text | nullable | null |
| verification_code | text | nullable | null |
| verification_code_expires_at | timestamptz | nullable | null |
| is_verified | boolean | | false |
| created_at | timestamptz | | now() |
| updated_at | timestamptz | | now() |

**Trigger:** `updated_at`. **RLS:** `auth.uid() = user_id`.
> Webhook handler pakai `service_role` key — bypass RLS.

### categories

| Kolom | Tipe | Constraint | Default |
|---|---|---|---|
| id | uuid PK | | gen_random_uuid() |
| user_id | uuid FK → auth.users.id | nullable (null = global default), ON DELETE CASCADE | null |
| name | text | NOT NULL | |
| type | text | CHECK IN ('income', 'expense'), NOT NULL | |
| icon | text | nullable | null |
| color | text | nullable | null |
| is_default | boolean | | false |
| created_at | timestamptz | | now() |

**Unique:** `(user_id, name, type)` — tidak boleh duplikat nama kategori dalam scope yang sama.
**RLS SELECT:** `auth.uid() = user_id OR user_id IS NULL`.
**RLS INSERT/UPDATE/DELETE:** `auth.uid() = user_id`.
**Seed:** Sisipkan kategori default dengan `user_id IS NULL` saat migrasi awal.

### transactions

| Kolom | Tipe | Constraint | Default |
|---|---|---|---|
| id | uuid PK | | gen_random_uuid() |
| user_id | uuid FK → auth.users.id | NOT NULL, ON DELETE CASCADE | |
| category_id | uuid FK → categories.id | nullable, ON DELETE SET NULL | null |
| type | text | CHECK IN ('income', 'expense'), NOT NULL | |
| amount | numeric | CHECK (amount > 0), NOT NULL | |
| description | text | nullable | null |
| date | date | NOT NULL | CURRENT_DATE |
| source | text | CHECK IN ('web', 'telegram'), NOT NULL | |
| created_at | timestamptz | | now() |
| updated_at | timestamptz | | now() |

**Index:** `(user_id, date DESC)` untuk query riwayat. **RLS:** `auth.uid() = user_id`.

### recurring_transactions

| Kolom | Tipe | Constraint | Default |
|---|---|---|---|
| id | uuid PK | | gen_random_uuid() |
| user_id | uuid FK → auth.users.id | NOT NULL, ON DELETE CASCADE | |
| category_id | uuid FK → categories.id | nullable, ON DELETE SET NULL | null |
| type | text | CHECK IN ('income', 'expense'), NOT NULL | |
| amount | numeric | CHECK (amount > 0), NOT NULL | |
| description | text | nullable | null |
| frequency | text | CHECK IN ('daily', 'weekly', 'monthly', 'yearly'), NOT NULL | |
| interval_value | integer | CHECK (interval_value > 0) | 1 |
| day_of_month | integer | nullable (1-31) | null |
| day_of_week | integer | nullable (0=Sun, 6=Sat) | null |
| start_date | date | NOT NULL | |
| end_date | date | nullable | null |
| last_generated_date | date | nullable | null |
| is_active | boolean | | true |
| created_at | timestamptz | | now() |
| updated_at | timestamptz | | now() |

**RLS:** `auth.uid() = user_id`.

### savings_goals

| Kolom | Tipe | Constraint | Default |
|---|---|---|---|
| id | uuid PK | | gen_random_uuid() |
| user_id | uuid FK → auth.users.id | NOT NULL, ON DELETE CASCADE | |
| name | text | NOT NULL | |
| target_amount | numeric | CHECK (target_amount > 0), NOT NULL | |
| current_amount | numeric | CHECK (current_amount >= 0) | 0 |
| deadline | date | nullable | null |
| category_id | uuid FK → categories.id | nullable, ON DELETE SET NULL | null |
| is_completed | boolean | | false |
| created_at | timestamptz | | now() |
| updated_at | timestamptz | | now() |

**Check:** `current_amount <= target_amount`. **RLS:** `auth.uid() = user_id`.

### debts

| Kolom | Tipe | Constraint | Default |
|---|---|---|---|
| id | uuid PK | | gen_random_uuid() |
| user_id | uuid FK → auth.users.id | NOT NULL, ON DELETE CASCADE | |
| counterparty_name | text | NOT NULL | |
| type | text | CHECK IN ('owe', 'owed'), NOT NULL | |
| amount | numeric | CHECK (amount > 0), NOT NULL | |
| description | text | nullable | null |
| due_date | date | nullable | null |
| is_paid | boolean | | false |
| created_at | timestamptz | | now() |
| updated_at | timestamptz | | now() |

**RLS:** `auth.uid() = user_id`.

---

## Ringkasan RLS Policy

| Tabel | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | `uid() = id` | `uid() = id` | `uid() = id` | ❌ (cascade) |
| telegram_links | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` |
| categories | `uid() = user_id OR user_id IS NULL` | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` |
| transactions | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` |
| recurring_transactions | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` |
| savings_goals | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` |
| debts | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` | `uid() = user_id` |

> Webhook bot Telegram pakai Supabase `service_role` key (bukan anon) karena tidak ada session user. Validasi via HMAC token dari Telegram. Service_role bypass RLS, jadi handle dengan hati-hati.
