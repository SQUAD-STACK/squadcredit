# SquadCredit

## What this is

A cash-flow credit and savings platform for Nigerian informal market traders, built for Squad Hackathon 3.0. Traders get a Squad-issued virtual account (NUBAN) that customers pay into. Every inbound payment trains an AI scoring model that unlocks progressive working capital, automated savings, and shop insurance. Repayment happens automatically as a percentage holdback on inflows.

## Why this wins

1. We own the payment rail through Squad virtual accounts. Repayment is collected from inflows before the trader touches the cash. This is the single architectural decision that separates lenders with sub-3% default rates (Square Capital, Moniepoint, OmniRetail) from lenders with 12-25% defaults (FairMoney, Tala, Branch).
2. Distribution through market associations (Balogun MTA, OMATA, CAPDAN, Ariaria) using Squad's aggregator/sub-merchant pattern. Each association is a sub-merchant on Squad. Traders sit underneath. Chairmen get dashboards and revenue share.
3. Network-of-trust scoring. We use Squad webhook sender data to build a customer-trader graph. New traders inherit credibility from their customers' overlap with already-trusted traders on the platform.

## Target user

Sade Adebayo, 34, fabric trader in Balogun Market. Makes ₦25-80k a day, mostly via bank transfers. No business bank account, no payslip, has been rejected twice for bank loans. Wants to expand to a second stall but needs ₦400k.

## Demo scenario

A teammate sends ₦12,500 from their phone to Sade's Squad virtual account during the live demo. Within 2 seconds: webhook fires, score updates from 642 to 651, credit limit recalculates from ₦18,000 to ₦19,400, savings rule auto-sweeps ₦625. Sade taps Borrow, accepts ₦19,400 at a flat 6% fee over 14 days, money lands in her personal bank account via Squad Payouts. Total elapsed: 30 seconds.

## Stack

- Frontend: Next.js 15 (App Router), Tailwind, shadcn/ui
- Backend: Next.js server actions and route handlers (no separate backend server)
- Database: Supabase Postgres with Realtime
- Background jobs: Inngest
- ML scoring: Python FastAPI service on Render (LightGBM + SHAP), called from TS backend
- Payments and accounts: Squad sandbox
- Hosting: Vercel

## Squad integration (verified working)

- Sandbox base URL: `https://sandbox-api-d.squadco.com`
- Auth: `Authorization: Bearer ${SQUAD_SECRET_KEY}` header on every request
- Confirmed working endpoints: `/transaction/initiate`, `/virtual-account`
- Test trader created: NUBAN 5519693166, beneficiary 4920299492, bank code 058 (GTBank)
- BVN validation in sandbox is permissive — `22222222222` works for test personas

## Squad endpoints we use

1. `POST /virtual-account` — create a NUBAN per trader on signup
2. Webhook receiver at `/api/webhooks/squad` — handle `payment_received` events with HMAC SHA-512 verification
3. `POST /payout/account/lookup` then `POST /payout/transfer` — disburse loans
4. `POST /merchant/create-sub-users` — create sub-merchants for market associations (phase 2)
5. Dynamic Virtual Accounts v2 — for ajo group savings (phase 2)
6. VAS endpoints for SMS notifications (phase 2)

## Database schema

### traders

- id (uuid, pk, default gen_random_uuid())
- phone (text, unique)
- first_name (text)
- last_name (text)
- email (text)
- market (text) — e.g. "Balogun Market", "Computer Village"
- business_type (text) — e.g. "fabric", "electronics", "food"
- squad_customer_id (text) — our internal id passed to Squad as customer_identifier
- virtual_account_number (text)
- beneficiary_account (text)
- bank_code (text)
- bvn (text, nullable for now)
- trust_score (integer, default 0)
- credit_limit (numeric, default 0)
- created_at (timestamptz, default now())

### transactions

- id (uuid, pk, default gen_random_uuid())
- trader_id (uuid, fk to traders.id)
- transaction_reference (text, unique)
- sender_name (text)
- sender_account (text, nullable)
- amount (numeric)
- settled_amount (numeric)
- transaction_date (timestamptz)
- raw_payload (jsonb)
- created_at (timestamptz, default now())

### loans

- id (uuid, pk, default gen_random_uuid())
- trader_id (uuid, fk to traders.id)
- principal (numeric)
- fee (numeric)
- total_due (numeric)
- amount_repaid (numeric, default 0)
- holdback_percentage (numeric) — e.g. 0.15 for 15%
- tier (integer) — 0 to 6
- status (text) — 'active', 'repaid', 'overdue', 'defaulted'
- disbursed_at (timestamptz)
- due_at (timestamptz)
- repaid_at (timestamptz, nullable)
- squad_payout_reference (text)

### savings

- id (uuid, pk, default gen_random_uuid())
- trader_id (uuid, fk to traders.id)
- balance (numeric, default 0)
- rule_type (text) — 'percentage_above_threshold'
- rule_percentage (numeric) — e.g. 0.05
- rule_threshold (numeric) — e.g. 5000
- goal_amount (numeric, nullable)
- goal_label (text, nullable)
- created_at (timestamptz, default now())

## Credit scoring model

### Trust score (0-1000)

Computed from 12 features. We start with a transparent rules-based weighted scorer and upgrade to LightGBM once we have enough synthetic data. Output paired with SHAP-style plain-language explanations.

### The 12 features

Cash flow:

1. Inflow total last 30 days
2. Active days last 30 days (days with at least one inflow)
3. Coefficient of variation of daily inflows (lower is better)
4. Inflow growth slope (week-over-week)
5. Mean transaction amount
6. Repeat sender share (% of inflows from senders we've seen before)
7. Sender concentration (Herfindahl index of inflows by sender)
8. Weekend share (% of inflows on Sat/Sun)

Behavioral: 9. App session count 10. % of borrow attempts during business hours

Identity and trust: 11. Days since onboarding 12. Network-of-trust score (overlap with other good-standing traders' senders)

### Tier ladder

- T0 Trial: ₦5-15k, 7 days, 5% flat fee, requires ≥14d history and ≥10 unique senders
- T1 Starter: ₦15-50k, 14 days, 6% flat fee, 15% holdback
- T2 Builder: ₦50-150k, 21 days, 7% flat fee, 15% holdback
- T3 Established: ₦150-500k, 30 days, 7.5% flat fee, 12% holdback
- T4 Growth: ₦500k-1.5M, 45 days, 9% flat fee, 10% holdback
- T5 Scale: ₦1.5M-5M, 60-90 days, 12% flat fee, 10% holdback
- T6 Anchor: ₦5M-25M, 90-180 days, 2-2.5%/mo declining

Loan size cap: never exceeds 30-60% of trailing inflow at the relevant tier.

### Repayment mechanism

Percentage holdback on inflows. When a webhook fires for a trader with an active loan, we hold back the loan's holdback_percentage of the settled_amount and apply it to amount_repaid before settling the rest to the trader. T0 and T1 use bullet repayment instead.

## Demo data

Pre-seed Sade's account with 60 days of synthetic-realistic inflows before the demo:

- Trader: Sade Adebayo, fabric, Balogun Market
- Average daily inflow: ₦35,000
- Variance: ~30%
- 6 days/week active (closed Sundays)
- 40 unique senders, of which 12 are repeat customers
- Three large wholesale inflows (₦150k-200k) per month
- Generate via Squad's `/virtual-account/simulate/payment` endpoint, not by inserting directly to the DB — this proves the webhook → DB → score → UI loop works on real data flow.

## Constraints and non-negotiables

- Never collect contacts, SMS, or location beyond opt-in geofence verification — DEON 2025 hard line
- Always show fees in flat naira amounts, never as compounding APR
- Adverse action explanations on every credit decision (DEON 2025 transparency rule)
- BVN gates only loans above T1, not platform access
- Repayment % can adjust down on a slow-day clause but never up without consent
- All copy uses sentence case, plain English, no fintech jargon
- Mobile-first PWA, no native apps

## Pricing positioning

We undercut FairMoney/Branch (30-260% APR) by 5-10x at every tier. Our T2 effective monthly rate is ~10%; FairMoney's equivalent is 30-100%+. We sit slightly above Moniepoint Working Capital (~9% pa for established merchants) because we serve a higher-risk, thinner-file segment.

## What we deliberately do not build for the hackathon

- Native iOS/Android apps (PWA only)
- Real production BVN/NIN verification (mock with consistent test BVN)
- Job seeker side (one mockup screen, frame as phase 2)
- Insurance integration (one mockup screen, phase 2)
- Production-grade fraud detection (rules-based for demo)
- Real ajo group savings (one mockup screen, phase 2)
- Customer-side discovery marketplace (basic browse page only)

## Code style

- Server actions for mutations, route handlers for webhooks
- Zod for all input validation
- All Squad API calls go through a typed client in `lib/squad.ts`
- All database access through typed Supabase clients in `lib/supabase/`
- Custom UI built from primitives (Radix UI primitives are fine for behavior, but visual styling is custom per design.md)
- Read .claude/commands/design.md before building any new component
- Sentence case throughout, plain English copy, no fintech jargon
- All naira amounts use the formatter from lib/format.ts (commas, optional kobo, ₦ prefix)
- All NUBANs and transaction references rendered in `font-mono`
