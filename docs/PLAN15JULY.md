# 🚀 PicisFlow Blueprint: Yahuy & Zero-Cost UX Expansion
> **Target Execution Date:** July 2026
> **Budget:** Rp 0,- (Pure Logic, Open Source & Native Web APIs)
> **Target Agent:** AI Coding Assistant / Developer Agent

This document serves as a high-level conceptual implementation plan for adding friction-free, high-fidelity UI/UX interactions and hardening system security for **PicisFlow**.

---

## 📑 Table of Contents
1. [Phase 1: Database & Seed Extensions (Emoji Aliases)](#phase-1-database--seed-extensions-emoji-aliases)
2. [Phase 2: Core Business Logic (Regex Mutation Parser)](#phase-2-core-business-logic-regex-mutation-parser)
3. [Phase 3: Telegram Mini App (WebApp) Integration & Auto-Auth](#phase-3-telegram-mini-app-webapp-integration--auto-auth)
4. [Phase 4: Frontend High-Fidelity Refinement (Framer Motion & Web Audio)](#phase-4-frontend-high-fidelity-refinement-framer-motion--web-audio)
5. [Phase 5: Debt/Piutang Completion (`/debts`)](#phase-5-debtpiutang-completion-debts)
6. [Phase 6: Infrastructure Sanity Checks & Hardening](#phase-6-infrastructure-sanity-checks--hardening)

---

## 🛠️ Phase 1: Database & Seed Extensions (Emoji Aliases)
Extend the existing tokenizer framework to parse visual emojis as concrete category matches, lowering writing friction down to 1-second interactions.

### 📝 Action Item 1.1: Update Category Seed File
*   **Target File:** `supabase/seed/01_default_categories.sql`
*   **Objective:** Modify the existing SQL seed mapping to append high-frequency transactional emojis (e.g., 🍔, ⛽, 🛒, 🎮) directly into the aliases text array metadata for each target financial category.

---

## 🔍 Phase 2: Core Business Logic (Regex Mutation Parser)
Build an algorithmic, rule-based text parser to ingest copy-pasted SMS or Push Notification details from standard Indonesian banking and fintech operators.

### 📝 Action Item 2.1: Create `src/lib/telegram/regexParser.ts`
*   **Objective:** Implement a pure JavaScript/TypeScript text analyzer utilizing regular expressions. The parser must recognize distinct textual patterns from local banks (e.g., BCA) and e-wallets (DANA, GoPay, OVO), correctly extracting the transaction amount and resolving whether it is an incoming transfer or an expense.

### 📝 Action Item 2.2: Hook to Webhook Route
*   **Target File:** `src/api/telegram/webhook/route.ts`
*   **Objective:** Intercept raw incoming text messages. Before passing them down to the existing multi-alias scoring matrix, execute the regex mutation function first. If a matching mutation string is found, skip the text processing fallback and parse the payload immediately.

---

## 📱 Phase 3: Telegram Mini App (WebApp) Integration & Auto-Auth
Integrate web interfaces tightly within Telegram’s native view port, leveraging cryptographically signed parameter contexts (`initData`) to remove continuous sign-in fatigue.

### 📝 Action Item 3.1: Mount Script Context inside Root Layout
*   **Target File:** `src/app/layout.tsx`
*   **Objective:** Inject the official Telegram WebApp script link (`telegram-web-app.js`) using Next.js native script tags set to run before full client-side execution.

### 📝 Action Item 3.2: Create Native Verification Endpoint
*   **Target File:** `src/app/api/auth/telegram-session/route.ts`
*   **Objective:** Write a dedicated validation endpoint to decode and verify Telegram's `initData` parameters against the secret bot token. If valid, seamlessly link or initialize a trusted Supabase user session without manual password prompt requirements.

---

## 🎨 Phase 4: Frontend High-Fidelity Refinement (Framer Motion & Web Audio)
Apply tactile visual structures utilizing Next.js 16 and Tailwind v4 frameworks to improve overall platform retention metrics.

### 📝 Action Item 4.1: Web Audio Synthesis (`src/hooks/useSound.ts`)
*   **Objective:** Leverage the browser's native Web Audio API to trigger immediate micro-sound interactions (e.g., short retro success tones) when transaction additions resolve properly, utilizing local assets hosted directly in the public asset path.

### 📝 Action Item 4.2: Neo-Brutalism Critical Budget Shaking Box
*   **Objective:** Update the component displaying budget states. Use Framer Motion to compute a programmatic side-to-side shaking keyframe animation that triggers whenever spent items cross an 85% safety threshold. The UI should mirror bold Neo-Brutalism aesthetics with hard visual color transitions.

---

## 📊 Phase 5: Debt/Piutang Completion (`/debts`)
Address lingering ledger features inside the framework architecture to deliver structural integrity.

### 📝 Action Item 5.1: Database Schema Modification
*   **Target File:** `supabase/migrations/20260717000001_debts.sql`
*   **Objective:** Generate a migration table explicitly handling debts with columns for amount tracking, target counterparty names, specific custom tags for tracking types (debt vs receivable), settlement status, and necessary Row Level Security policies.

### 📝 Action Item 5.2: Server Actions Pipeline (`src/lib/debts/actions.ts`)
*   **Objective:** Author full-stack data mutation server handlers using the initialized Supabase server-side clients to implement secure creation, soft tracking, updates, and automatic path revalidations for the `/debts` route layout.

---

## 🛡️ Phase 6: Infrastructure Sanity Checks & Hardening
Audit edge cases to protect application integrity, prevent operational fraud, and eliminate double-accounting hazards.

### 📝 Action Item 6.1: Webhook Idempotency & Retry Handling
*   **Target File:** `src/api/telegram/webhook/route.ts`
*   **Objective:** Ensure the endpoint tracks unique incoming message payload IDs. If network latency delays the response and Telegram re-fires the identical request, verify the duplication dynamically against database records before processing to eliminate duplicate ledger mutations.

### 📝 Action Item 6.2: Timezone Lock Enforcements
*   **Target Framework:** Supabase Database Schema & Middleware
*   **Objective:** Enforce explicit localized timestamp constraints (GMT+7/WIB) for all data mutation queries instead of shifting into fallback server UTC defaults. This mitigates midnight transaction rollbacks and aligns analytics precisely with the user's active logging cycles.

### 📝 Action Item 6.3: Cron Endpoint Access Restriction
*   **Target File:** `src/api/cron/daily/route.ts`
*   **Objective:** Restrict open invocation access. Require and validate a cryptographically secure token parameter inside the incoming headers before starting administrative sequences (such as trigger notifications or cleaning session tables), returning unauthorized statuses to external manual requests.