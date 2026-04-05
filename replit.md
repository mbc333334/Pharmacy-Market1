# دواء+ (Dawaplus) Workspace

## Overview

pnpm workspace monorepo using TypeScript. **دواء+** is a pharmacy & medicine platform for the Kurdistan Region and Iraq, supporting pharmacies, warehouses, delivery companies, and customers.

## Platform Components

| Component | Path | URL | Color |
|-----------|------|-----|-------|
| Admin Portal | `artifacts/dawaaplus-web` | `/dawaaplus-web` | `#7C3AED` |
| Pharmacy Portal | `artifacts/dawaaplus-pharmacies` | `/dawaaplus-pharmacies` | `#1A9E6E` |
| Warehouse Portal | `artifacts/dawaaplus-warehouses` | `/dawaaplus-warehouses` | `#0D7A54` |
| Delivery Portal | `artifacts/dawaaplus-delivery` | `/dawaaplus-delivery` | `#D69E2E` |
| Mobile App (Expo) | `artifacts/dawaaplus` | `/dawaaplus` | `#3B82F6` |
| API Server | `artifacts/api-server` | `/api` | — |

## API Server

- Express 5 API running on port 8080 at `/api/...`
- Routes: `auth`, `pharmacies`, `warehouses`, `delivery`, `products`, `orders`, `otp`, `admin`
- All portals have `src/api.ts` client that calls the API with localStorage fallback

## Login Credentials

| Type | Phone/ID | Password |
|------|----------|----------|
| Admin | `admin` | `admin` |
| Pharmacy | `07501234567` (ph1) | `123456` |
| Warehouse | `07501111111` (wh1) | `123456` |
| Delivery | `07501222222` (dc1) | `123456` |

## Admin Portal Access

- **Hidden** — not accessible from the landing page directly
- Access via: **5 taps** on the دواء+ logo OR **Ctrl+Shift+A**
- Landing page at `/dawaaplus-web` shows public marketing page

## Database

- **PostgreSQL** via Replit managed DB (DATABASE_URL env var)
- **Drizzle ORM** schema at `lib/db/src/schema/index.ts`
- 12 tables: `admins`, `pharmacies`, `warehouses`, `delivery_companies`, `customers`, `products`, `orders`, `order_items`, `drivers`, `trips`, `announcements`, `otp_codes`, `payments`
- Seed data: 1 admin, 4 pharmacies, 4 warehouses, 4 delivery companies

## Data Sync Architecture

Each portal:
1. On login → loads data from localStorage (fast/offline)
2. After login → syncs fresh data from API (overwrites localStorage cache)
3. On save → writes to both localStorage AND API
4. Admin portal → polls API every 15s + BroadcastChannel sync

## Subscription Plans

- **Free** — basic features
- **Standard** — `40,000 د.ع/month` (pharmacies/warehouses) or `40,000 د.ع/month` (delivery)
- **Premium** — `75,000–80,000 د.ع/month` — full features, ads, priority listing

## i18n (Mobile App)

- Translations: `artifacts/dawaaplus/constants/translations.ts` — 70+ keys
- Languages: ar, ku, en, fa, tr, fr, de, es, ru, zh, ko, ja, ur (13 total)
- Use `indexOf()` instead of `Set.has()` for Hermes JS engine compatibility

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **API**: Express 5 + PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite (portals), Expo + React Native (mobile)
- **Build**: esbuild (API), Vite (portals)

## Important Notes

- All 4 portals share the same domain → **localStorage is shared across portals**
- Admin portal reads subscriber data from shared localStorage + API
- API server handles `change-password` via `/api/auth/change-password`
- OTP flow: `/api/otp/send` generates 6-digit code, `/api/otp/verify` checks it
- Warehouse = **مذخر** (singular), **مذاخر** (plural)
