# B2B Marketplace Platform

A wholesale marketplace where manufacturers list products and retailers order
from them directly. Next.js App Router, Prisma and PostgreSQL, with Stripe for
payment and a KYC flow gating who is allowed to trade.

## What is built

**Two account types, plus admin.** Companies (suppliers) manage a catalogue and
fulfil orders; retailers browse, order and pay. Authentication is NextAuth with
role-based routing into separate dashboards.

**Catalogue and inventory.** Products carry categories, media, stock levels and
per-product pricing rules, each with its own endpoint
(`api/products/[id]/inventory`, `api/products/[id]/pricing`) so stock and price
can be updated without touching the product record.

**Orders.** Placement, line items, and a separate `OrderStatusHistory` model so
state changes are an append-only record rather than a mutable status column.
Order statistics are exposed at `api/orders/stats`.

**Payments.** Stripe payment intents, a confirmation endpoint, and a webhook
handler at `api/webhooks/stripe` so settlement is driven by Stripe's events
rather than by the browser returning successfully.

**KYC.** Retailers submit documents (`api/kyc/submit`, `api/kyc/documents`);
admins review and approve them (`api/admin/kyc/review`). Accounts carry a status
that gates access.

The data model is 14 Prisma models covering users, companies, retailers,
categories, orders, order items, status history, payments, reviews, promotions,
notifications and per-side analytics.

## Not built

The landing page describes multi-carrier logistics, route optimisation, demand
forecasting and buy-now-pay-later. Those are product copy for a planned roadmap,
not implemented features — there is no carrier integration or credit-scoring
engine in this codebase. Planning documents for that scope are in `01.md` and
`02-technical-implemtation.md`.

## Stack

Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · NextAuth · Stripe ·
Tailwind CSS · Zod · Recharts · Framer Motion

## Running it

Requires Node.js and PostgreSQL.

```bash
npm install

# create .env with DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
# and your Stripe keys

npx prisma migrate dev
npm run dev
```

See `SETUP.md` for the longer walkthrough.
