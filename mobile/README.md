# Sophia Couture — Mobile App (React Native + Expo)

A native mobile version of the [Sophia Couture](https://sophia-couture.vercel.app) store,
built with **Expo (SDK 57) + Expo Router**. It shares the **same Supabase backend,
products, inventory, customer accounts and order system** as the website — there is no
separate mobile database.

> The Next.js website at the repository root is untouched by this folder.

## Features

- Home with hero banner + "New & Trending" product grid
- Shop catalog with **functional search** (name/description) and **category filtering**
- Product details: images, price, description, size selection (S–XXL), quantity, size guide
- Cart with quantity steppers, stock clamping and a live badge count
- Signed-in carts synchronized with the website through the existing `carts` and
   `cart_items` tables; guest carts stay local and merge at sign-in
- Checkout (requires sign-in, like the website) posting to the **existing**
  `POST /api/orders` backend — including the Mailgun confirmation email
- Email sign-up/sign-in and Google OAuth through the **same Supabase Auth project**
   (accounts shared web + mobile)
- Order history reading the same `orders` / `order_items` tables (RLS-scoped)
- Contact and account screens mirroring the website

## Getting started

```bash
npm install
npm start          # then scan the QR code with the Expo Go app
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run test:cookie # proves the checkout cookie format matches @supabase/ssr
```

## Environment (`.env`)

Only **public** client-side values are allowed here:

```
EXPO_PUBLIC_SUPABASE_URL=...        # same as the website
EXPO_PUBLIC_SUPABASE_ANON_KEY=...   # anon (public) key — same as the website
EXPO_PUBLIC_SITE_URL=https://sophia-couture.vercel.app
```

**Never** add `SUPABASE_SERVICE_ROLE_KEY`, `MAILGUN_API_KEY`, or any server-only
credential to this app or its env files — every `EXPO_PUBLIC_*` value is compiled
into the JS bundle shipped to devices.

`EXPO_PUBLIC_SITE_URL` is used to resolve relative product image paths
(`/products/…`) so images are loaded directly from the website and stay in sync.

## Google sign-in redirect URLs

The app generates its callback with Expo `makeRedirectUri({ path: 'auth-callback' })`.
In Expo Go it uses the active Metro host (currently
`exp://192.168.100.14:8082/--/auth-callback`); the host and port can change when
Metro restarts. Do not replace this with a localhost URL.

In Supabase **Authentication → URL Configuration → Redirect URLs**, allow:

- `exp://**/--/auth-callback` (Expo Go; the host and port vary by development session)
- `sophiacouture://auth-callback` (standalone/dev build)
- `http://localhost:3000/auth/callback` (website local development; add the actual local port if it differs)
- `https://ecommerce-mvp-chi.vercel.app/auth/callback` (current website deployment)

The existing Expo config already declares the `sophiacouture` scheme for native builds; Expo Go itself returns through the generated `exp://` URL.

In **Authentication → Providers → Google**, keep Google enabled and configured with the existing web OAuth client. In Google Cloud, add the production website origin (`https://ecommerce-mvp-chi.vercel.app`) and the local website origin as authorized JavaScript origins. The authorized redirect URI must be the Supabase provider callback shown in that dashboard, normally `https://brjabisbachtnqbetlye.supabase.co/auth/v1/callback`. Do **not** add the Expo `exp://` URL to Google Cloud: Google returns to Supabase, and Supabase then redirects to Expo Go. A separate Android/iOS Google client is only needed if switching to Google's native sign-in SDK; this app uses the browser OAuth flow.

## Email verification delivery

Supabase currently has email auth enabled and email auto-confirm disabled, so new
accounts require a confirmation email. In **Authentication → Email Templates →
Confirm signup**, keep the link pointed at `{{ .ConfirmationURL }}`; do not hardcode
the website URL. If the template constructs its own final redirect, use
`{{ .RedirectTo }}` so the app-provided Expo URL is retained.

In **Authentication → SMTP Settings**, configure a verified custom SMTP sender
for customer delivery. Supabase documents that its default sender only sends to
addresses on the project's organization team and is currently limited to two
messages per hour. SMTP configuration is not exposed by the public Auth settings
API, so confirm whether a custom sender is enabled in the dashboard.

Add `exp://**/--/auth-callback` to Supabase's redirect allowlist for email
verification and OAuth. The mobile callback accepts authorization codes,
access/refresh-token fragments, and verification `token_hash` links, then stores
the session in AsyncStorage through the shared Supabase client.

## How checkout stays in sync

1. The app tries the existing website API (`POST {SITE_URL}/api/orders`) with the
   Supabase session serialized in the exact `@supabase/ssr` cookie format
   (`src/lib/ssrCookie.ts`, verified by `scripts/test-ssr-cookie.ts`). The server
   performs the same validation, trusted pricing, order insert and email as the web.
2. If the API cannot authenticate the request (host unreachable / 401), it falls back
   to inserting the order directly through Supabase RLS — same tables, same
   `'Confirmed'` status, same `ORD-…` numbering. (The fallback path cannot send the
   Mailgun email because those credentials stay server-side.)

Prices and stock are always read from the database; the app never sends prices.

## How cart sync works

Signed-in users load and save cart lines in the existing `carts` and
`cart_items` tables under their current Supabase session and RLS policies. The
web and mobile clients refresh shared contents on focus/foreground and poll
while active; Realtime updates are also subscribed to when available. Guest
carts remain local and are merged into the account cart at sign-in. No cart
tables or database schema changes are created by this app.
