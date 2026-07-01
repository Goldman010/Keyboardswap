# KeyboardSwap

KeyboardSwap is a marketplace for custom mechanical keyboards, inspired by [Cars & Bids](https://carsandbids.com/). The product goal is a clean, trustworthy place to buy and sell enthusiast keyboards through auctions and fixed-price listings, with every listing reviewed before it goes live.

---

## Project overview

### What we're building

A desktop-first marketplace where keyboard enthusiasts can:

- **Browse** approved listings on a clean, modern homepage
- **Sell** keyboards by submitting listings for admin review
- **Buy** via timed auctions or fixed-price listings (planned)
- **Trust** the platform through curation, clear pricing, and transparent seller info

### Design principles

| Principle | Meaning |
|-----------|---------|
| **Clean modern design** | Minimal UI, generous whitespace, readable typography, subtle borders and shadows — no clutter |
| **Desktop-first** | Layouts and interactions optimized for large screens; responsive down to mobile |
| **Trustworthy marketplace** | Admin approval before listings go live, clear condition labels, honest descriptions, professional presentation |
| **Cars & Bids inspiration** | Card-based listing grids, emphasis on photos and specs, auction countdowns and bid history (roadmap) |

### Current state (MVP)

The app currently supports:

- Homepage listing grid (approved listings only)
- Sell flow with form submission into `pending` status
- Supabase-backed `listings` table with Row Level Security
- Listing statuses: `pending` → `approved` → `sold`

Not yet implemented: user auth, admin approval UI, listing detail pages, photos, auctions, bidding, and fixed-price checkout.

---

## Tech stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Server Components by default; Client Components only when needed |
| **Language** | TypeScript (strict) | Shared types in `lib/types/` |
| **UI** | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling; zinc palette for neutrals |
| **Fonts** | Geist Sans / Geist Mono | Loaded via `next/font/google` |
| **Database & backend** | [Supabase](https://supabase.com/) | Postgres, RLS policies, `@supabase/supabase-js` client |
| **Linting** | ESLint + `eslint-config-next` | Run with `npm run lint` |

### Key directories

```
app/              Next.js App Router pages and layouts
components/       Reusable UI components
lib/              Supabase client, shared types, utilities
supabase/
  migrations/     SQL schema and RLS policies (source of truth for DB)
```

### Environment variables

Required in `.env.local` (never commit):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Coding standards

### Next.js

- Use the **App Router** (`app/`). Do not add Pages Router routes.
- Prefer **Server Components** for data fetching; add `"use client"` only for interactivity (forms, hooks, browser APIs).
- Read Next.js docs in `node_modules/next/dist/docs/` before using APIs — this project uses Next.js 16, which may differ from older versions.
- Use `searchParams` and route params as **Promises** where required by the current Next.js version.

### TypeScript

- Keep `strict: true`. Avoid `any`.
- Define domain types in `lib/types/` (e.g. `Listing`, `ListingStatus`) and reuse them across app and components.
- Use the `@/*` path alias for imports.

### React & components

- One component per file in `components/` unless tightly coupled helpers (e.g. `EmptyListings` alongside `ListingCard`).
- Props typed with explicit object types (`type FooProps = { ... }`).
- Colocate formatting helpers (e.g. `formatPrice`) in the component file when small and single-use.

### Styling (Tailwind)

- **Desktop-first**: start with full-width layouts (`max-w-6xl`, multi-column grids), then add `sm:` / `lg:` breakpoints for smaller screens.
- Use the established **zinc** neutral palette (`zinc-50` backgrounds, `zinc-900` primary actions, `zinc-200` borders).
- Cards: `rounded-xl border border-zinc-200 bg-white p-5 shadow-sm`.
- Buttons: `rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white` with hover/disabled states.
- Forms: labeled fields with `rounded-lg border border-zinc-300` inputs.

### Supabase & data

- **Schema changes** go in new files under `supabase/migrations/` — do not edit applied migrations in place.
- **RLS is mandatory** for all public tables. Public reads should only expose safe data (e.g. `status = 'approved'`).
- New listings must default to `status = 'pending'` until an admin approves them.
- Keep `lib/supabaseClient.ts` as the single browser/server anon client entry point unless auth requires a split.

### General

- **Minimal scope**: smallest correct change; match existing patterns before introducing new abstractions.
- **No secrets in code**: env vars only; never commit `.env.local`.
- **No drive-by refactors**: don't rename, reformat, or restructure unrelated code.
- Run `npm run lint` after substantive changes.

---

## Future roadmap

Phases are ordered roughly by dependency. Items within a phase can be parallelized.

### Phase 1 — Core marketplace (in progress)

- [x] Listings schema with approval workflow (`pending` / `approved` / `sold`)
- [x] Homepage grid of approved listings
- [x] Sell form and pending submission flow
- [ ] Listing detail page (`/listings/[id]`)
- [ ] Photo uploads (Supabase Storage)
- [ ] Admin approval UI (approve / reject pending listings)

### Phase 2 — Listing types

- [ ] **Listing type** field: `auction` vs `fixed_price`
- [ ] Fixed-price: buy-now flow and sold-state handling
- [ ] Auctions: end time, reserve price, bid increments
- [ ] Real-time or near-real-time bid updates (Supabase Realtime)

### Phase 3 — Trust & identity

- [ ] Supabase Auth (sign up / sign in)
- [ ] Seller profiles tied to listings (replace free-text `seller_username`)
- [ ] RLS updates: sellers manage own listings; admins approve
- [ ] Optional: seller ratings or transaction history

### Phase 4 — Discovery & polish

- [ ] Search and filters (layout, switch type, price range, condition)
- [ ] Sort options (newest, ending soon, price)
- [ ] Email notifications (outbid, auction ending, listing approved)
- [ ] SEO metadata and Open Graph for listing pages

### Phase 5 — Payments & operations (later)

- [ ] Payment integration (Stripe or similar)
- [ ] Escrow or platform fee model
- [ ] Dispute / moderation tooling

---

## Things the AI should never change without asking

These are product and security boundaries. Ask the project owner before modifying any of them.

### Product & workflow

1. **Admin approval before listings go live** — New listings must start as `pending` and only `approved` listings appear on the public marketplace. Do not bypass or remove this gate.
2. **Listing status model** — Do not rename or remove `pending`, `approved`, or `sold` without explicit approval. These drive RLS and UX copy.
3. **Cars & Bids–inspired direction** — Do not pivot the UX toward a generic classifieds or e-commerce pattern (e.g. instant publish, cart checkout) without discussion.
4. **Desktop-first layout** — Do not mobile-only redesigns that break the primary desktop experience.

### Security & data

5. **Row Level Security policies** — Do not weaken, disable, or bypass RLS on `listings` or future tables. New tables need RLS from day one.
6. **Applied Supabase migrations** — Do not edit migration files that may already be applied. Add new migrations instead.
7. **Environment variables and secrets** — Do not commit `.env` files, hardcode API keys, or expose service-role keys to the client.
8. **Public visibility rules** — Do not expose `pending` or draft listings to unauthenticated public queries.

### Architecture & dependencies

9. **Core tech stack** — Do not replace Next.js, Supabase, TypeScript, or Tailwind with alternatives without approval.
10. **Major dependency upgrades** — Do not bump Next.js, React, or Supabase major versions without asking.
11. **Auth model** — When auth is added, do not ship a different provider or session strategy without alignment (Supabase Auth is the planned approach).

### Repository & process

12. **Git history** — Do not force-push, hard-reset, or amend commits unless explicitly requested.
13. **Unrelated refactors** — Do not rename the project, restructure folders, or rewrite working code outside the task scope.
14. **New documentation files** — Do not add README/ARCHITECTURE/other markdown files unless the user asks (this file excepted as requested).

---

## Quick reference

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

When in doubt: preserve trust (approval workflow), preserve security (RLS), match existing UI patterns (zinc, cards, desktop grid), and ask before changing anything listed above.
