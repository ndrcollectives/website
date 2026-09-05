# NDR Collectives

Pokémon TCG news, upcoming set release calendar, and a marketplace for
singles, sealed product, and graded slabs — built with Next.js (App Router),
Supabase, and Stripe.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** Supabase (Postgres, Auth, Row Level Security, Storage)
- **Payments:** Stripe Checkout + webhooks
- **Hosting:** Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run **every file in `supabase/migrations/` in order** against your
   project (via the SQL editor, or the Supabase CLI: `supabase db push`).
   `0001_init.sql` creates all tables, RLS policies, the
   inventory-decrement RPC, and the storage buckets (`product-images`,
   `news-assets`, `set-assets`); `0002_fix_profiles_rls_recursion.sql`
   fixes a recursive-policy bug in the admin RLS checks from `0001` — if
   you already ran `0001` before this file existed, just run `0002` on
   its own to patch it (you'll see `infinite recursion detected in
   policy for relation "profiles"` in logs if you're hitting this).
3. To make your own account an admin, sign up once through the app, then in
   the SQL editor run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
4. (Optional) Enable Google as an OAuth provider under
   Authentication → Providers if you want "Continue with Google" to work.

### 3. Configure Stripe

1. Grab your test **Secret key** and **Publishable key** from the Stripe
   Dashboard.
2. Create a webhook endpoint pointing at `/api/webhooks/stripe` and copy its
   signing secret. For local development, use the Stripe CLI instead:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in the Supabase and Stripe
values above.

### 5. Set release data

News articles are admin-authored through the CMS at `/admin/news` — there's
no external news source. Set data (names, release dates, card counts,
artwork) is kept in sync with the [Pokémon TCG API](https://pokemontcg.io)
instead of hand-entry:

- Click **"Sync Sets from Pokémon TCG API"** on `/admin/sets` to sync
  on demand.
- `vercel.json` also schedules `/api/cron/sync-sets` to run daily. Set
  `CRON_SECRET` in your environment so only Vercel Cron (or you, with the
  same bearer token) can trigger it.
- The public API only covers sets that have actually been announced/
  printed with a real release date — a set that's rumored but not yet
  confirmed still needs to be added manually on `/admin/sets` until the
  API picks it up, at which point the next sync reconciles it (matched
  by the API's set code).

### 6. Seed sample data (optional)

```bash
npm run seed
```

### 7. Run the dev server

```bash
npm run dev
```

## Project Structure

- `src/app` — routes (App Router): homepage, `/news`, `/sets`, `/shop`,
  `/cart`, `/account`, `/admin`, and API routes for checkout + the Stripe
  webhook.
- `src/components` — shared UI (design-system primitives, navbar, cart
  drawer, product card with the holo-foil hover effect, countdown timer).
- `src/lib` — Supabase clients (browser/server/admin), Stripe client,
  typed data-fetching helpers, and auth utilities.
- `supabase/migrations` — SQL schema and RLS policies.
- `scripts/seed.ts` — sample data loader.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel and set the environment variables from
   `.env.example` (including `NEXT_PUBLIC_SITE_URL` set to your production
   URL).
3. Point your Stripe webhook endpoint at
   `https://<your-domain>/api/webhooks/stripe`.
4. Deploy — Vercel builds and hosts the app on its edge network with
   preview deployments for every PR.
