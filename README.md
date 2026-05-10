# SquadCredit

A cash-flow credit and savings operating system for Nigerian informal market traders. Built for Squad Hackathon 3.0.

Customers pay traders via a Squad-issued virtual account. Our AI scores every transaction in real time, unlocking progressive working capital that auto-repays from inflows. Distributed through market associations like Balogun MTA, OMATA, and CAPDAN.

## Demo

[link to deployed Vercel URL]

## Stack

Next.js 15 (App Router), Supabase Postgres + Realtime, Inngest, LightGBM (Python ML service), Squad APIs, Tailwind CSS

---

## Local Development Setup

This guide walks you through getting the app running on your own machine from scratch.

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- A **Squad sandbox account** — [sandbox.squadco.com](https://sandbox.squadco.com)
- **One of the following** for your database (see Step 2 below):
  - A free **Supabase cloud account** — [supabase.com](https://supabase.com) *(easiest, no extra software needed)*
  - **Docker Desktop** (for a fully local database) — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

---

### Step 1 — Clone and Install

```bash
git clone <your-repo-url>
cd squadcredit
npm install
```

---

### Step 2 — Set Up the Database (choose one option)

You need a running Supabase database. Choose **Option A** (cloud, easier) or **Option B** (local Docker).

---

#### Option A: Cloud Supabase (Recommended for beginners)

This uses the free hosted version of Supabase. No Docker or extra software needed.

**2A.1 — Create a project**

1. Go to [supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **New project**, fill in a name and a database password (save the password — you'll need it).
3. Wait 1–2 minutes for the project to be provisioned.

**2A.2 — Get your API keys**

1. From your project dashboard, click the **Settings (gear icon)** in the left sidebar.
2. Under the **Configuration** heading in that settings menu, click **API**.
3. On the API page, you will find:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **Project API keys** section:
     - `anon` / `public` key — a long string starting with `eyJ...`
     - `service_role` / `secret` key — click the **Reveal** button to show it (also starts with `eyJ...`, keep this private)

> ⚠️ Never commit your `service_role` key to git. It has full unrestricted access to your database.

**2A.3 — Push database tables to your cloud project**

The repo includes migration files that create all the required tables. Push them up to your cloud project:

```bash
# Log in to the Supabase CLI
npx supabase login
# (It will open a browser page — copy the access token and paste it back into the terminal)

# Link the CLI to your specific cloud project
# Replace YOUR_PROJECT_REF with the ID from your project URL (e.g. hidycshrqkwelbtcjglp)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the migrations (creates all tables)
npx supabase db push
```

When prompted, enter the database password you set when creating the project.

**2A.4 — Seed the demo data**

The dashboard shows a demo trader called "Sade Adebayo". You need to add her to your database:

1. Go to your project on the Supabase dashboard and open the **SQL Editor** from the left sidebar.
2. Open the file `supabase/seed.sql` from this repo in your code editor and copy all of its contents.
3. Paste the contents into the Supabase SQL Editor on the website and click the green **Run** button.

---

#### Option B: Local Supabase with Docker

This option runs the entire Supabase stack on your own machine. No internet connection required once set up.

**Prerequisites:** Docker Desktop must be installed and **running** before you continue.

**2B.1 — Start the local Supabase stack**

```bash
npx supabase start
```

The first time you run this it will download the required Docker images (around 500 MB). This may take several minutes. Subsequent starts are much faster.

Once it finishes, it will print output like this in your terminal:

```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**Copy these values** — you will use them in Step 3.

> The local migrations in `supabase/migrations/` are applied automatically on startup, so your tables are already created.

**2B.2 — Seed the demo data locally**

```bash
npx supabase db seed
```

This runs `supabase/seed.sql` and inserts the demo trader (Sade Adebayo) into your local database.

**To stop the local database when you're done:**

```bash
npx supabase stop
```

---

### Step 3 — Configure Environment Variables

Create a file called `.env.local` in the root of the project. This file is already in `.gitignore` so it will never be accidentally committed.

```bash
# Copy the example (or create from scratch)
# Option: manually create the file .env.local in the project root
```

Paste the following content into `.env.local` and fill in your values:

```env
# ─── Squad API ────────────────────────────────────────────────────────────────
# Sandbox base URL — keep this exactly as-is for local development
SQUAD_API_BASE_URL="https://sandbox-api-d.squadco.com"

# Your Squad sandbox Secret Key from sandbox.squadco.com → Settings → API Keys
# It typically starts with "sandbox_sk_..."
SQUAD_SECRET_KEY="sandbox_sk_your_key_here"

# ─── Supabase ─────────────────────────────────────────────────────────────────
# If using cloud Supabase (Option A):
#   Copy these from your project dashboard → Settings → API
# If using local Docker Supabase (Option B):
#   Copy these from the terminal output of `npx supabase start`
#   The API URL will be http://127.0.0.1:54321

NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Step 4 — Get your Squad Sandbox Secret Key

1. Go to [sandbox.squadco.com](https://sandbox.squadco.com) and log in (or create a free test account).
2. In the sidebar, click **Settings**.
3. Click the **Developers** or **API Keys** tab.
4. Copy your **Secret Key** (starts with `sandbox_sk_...`) and paste it into your `.env.local` as `SQUAD_SECRET_KEY`.

---

### Step 5 — Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app should load and redirect you to the dashboard showing Sade Adebayo's trader profile. If you see **"Supabase isn't connected yet"**, it means either your keys are missing/incorrect in `.env.local` or the demo seed data hasn't been inserted — go back and check Steps 2 and 3.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `SQUAD_API_BASE_URL` | Yes | Squad API base URL. Use `https://sandbox-api-d.squadco.com` for testing. |
| `SQUAD_SECRET_KEY` | Yes | Your Squad sandbox secret key. Get it from the Squad sandbox dashboard. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL. From Supabase dashboard → Settings → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key. Safe to expose to the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key. Server-side only. Never expose to the browser. |

---

## Database Schema Overview

The following tables are created by `supabase/migrations/001_initial_schema.sql`:

| Table | Purpose |
|---|---|
| `traders` | One row per trader. Stores their profile, Squad virtual account number, trust score, and credit limit. |
| `transactions` | Inbound payments received via Squad webhook. Used to compute the trust score. |
| `loans` | Active and historical loans. Tracks principal, fee, holdback %, and repayment status. |
| `savings` | One savings pot per trader. Tracks balance and the auto-sweep rule. |

Row Level Security (RLS) is enabled on all tables. All server-side queries use the `service_role` key which bypasses RLS. The `anon` key has no direct table access.

---

## Simulating a Payment (Webhook Demo)

Once the app is running you can simulate an inbound payment to Sade's virtual account. This triggers the Squad webhook which updates her trust score and credit limit in real time.

Use the Squad sandbox simulate endpoint (you can call this from the Supabase SQL editor, a REST client like Postman, or a script):

```
POST https://sandbox-api-d.squadco.com/virtual-account/simulate/payment
Authorization: Bearer <SQUAD_SECRET_KEY>
Content-Type: application/json

{
  "virtual_account_number": "5519693166",
  "amount": "12500"
}
```

After sending this, refresh the dashboard and you should see the new transaction appear and Sade's score update.

---

## Troubleshooting

**"Supabase isn't connected yet" on the dashboard**
- Check your `.env.local` keys are correct and have no extra spaces or quote issues.
- Make sure the seed data has been inserted (`supabase db seed` for local, or run `seed.sql` in the cloud SQL editor).
- Restart `npm run dev` after editing `.env.local`.

**`EPERM: operation not permitted` warnings from npm/npx on Windows**
- This is harmless. It is a Windows file-locking issue with npx's temporary cache cleanup. Ignore it and re-run the command if needed.

**`Access token not provided` when running `npx supabase link`**
- Run `npx supabase login` first to authenticate the Supabase CLI.

**`Request timed out` errors for fonts in the terminal**
- The app tries to load JetBrains Mono from Google Fonts. On slow or restricted networks this may time out. The app falls back to a system font and continues working normally — you can safely ignore these warnings.

---

## Built by

Squad Stack
