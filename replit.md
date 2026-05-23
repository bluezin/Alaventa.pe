# Mercado Perú

Marketplace al estilo OLX para Perú — publica anuncios gratis, contacta vendedores por WhatsApp, y destaca tu anuncio por S/ 29.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/marketplace run dev` — run the React frontend (port 20787)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v4, wouter, @tanstack/react-query
- Auth: Clerk (`@clerk/react` on client, `@clerk/express` on server) — cookie-based, no bearer tokens
- API: Express 5 + OpenAPI spec → Orval codegen
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all routes)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (don't edit manually)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/db/schema.ts` — Drizzle ORM schema
- `artifacts/marketplace/src/pages/` — All page components
- `artifacts/marketplace/src/components/` — Navbar, ListingCard, CategorySidebar, AdBanner

## Architecture decisions

- **Cookie-based auth (web)**: Clerk uses session cookies on web — never use `setAuthTokenGetter` or Bearer tokens in the frontend. Only use Bearer tokens for mobile (Expo) apps.
- **OpenAPI-first**: All API changes start in `openapi.yaml`, then run `codegen` to regenerate hooks.
- **Featured listings**: S/ 29 — mark `is_featured = true` after payment; simple `paymentReference` field for now.
- **WhatsApp contact**: `wa.me/51PHONE?text=...` links generated server-side in the `whatsappUrl` field on each listing.
- **30-day expiry**: `expires_at = NOW() + 30 days` at creation; renewal resets to 30 days from now. 7-day warning shows in dashboard.

## Product

- **Home page**: Hero with stats, category sidebar, listing grid, ad placeholders
- **Browse & search**: Filter by category, search by keyword, paginated results
- **Listing detail**: Photo carousel, seller info, WhatsApp contact button, masked phone number
- **Publish**: Free listing creation, 30-day expiry, up to 5 image URLs
- **Dashboard**: View/manage own listings, renew expiring listings, feature for S/ 29, delete
- **Profile**: Edit name + phone, photo comes from Google/Facebook via Clerk
- **Auth**: Google + email/password via Clerk

## Gotchas

- After changing Clerk secrets, restart BOTH workflows (api-server + marketplace)
- `@clerk/react` v6 uses `<Show when="signed-in">` not `<SignedIn>` — different API from `@clerk/clerk-react`
- Route order in Express: `/listings/stats/summary` and `/listings/expiring-soon` must come before `/:id`
- Category counts are updated via bulk UPDATE after listing operations
- Demo listings use `user_id = 'demo_user_1'` — they won't appear in any user's dashboard

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk setup and customization
