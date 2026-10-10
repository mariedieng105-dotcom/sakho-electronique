# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Showcase + ordering site for **Sakho Électronic**, an electronics shop in Médina, Dakar (Senegal). Plain static
HTML/CSS/JS — no framework, no package.json, no build step. UI text and code comments are in French.

The owner is non-technical and writes in French: answer in French, step by step, and expect screenshots.
She also plans to resell this site to other shops (see "Per-shop configuration").

## Deploy & preview

- **Production = GitHub Pages from the root of `main`** (`.nojekyll` present). Pushing to `main` publishes in
  ~1–2 min (GitHub Actions run "pages build and deployment"). The owner asked for changes to go to `main`.
- URL: https://mariedieng105-dotcom.github.io/sakho-electronique/
- **Cache busting is manual**: whenever `assets/css/style.css` or any `assets/js/*.js` changes, bump the
  `?v=…` query on all four asset tags in `index.html` (style.css, config.js, main.js, admin.js). Browsers
  served stale CSS/JS before this was added.
- Local preview: open `index.html` directly, or `python3 -m http.server` from the repo root.

## Checks

There is no linter or test suite. What has been used so far:

- Syntax check: `for f in assets/js/*.js; do node --check "$f"; done` (for `apps-script/Code.gs`, copy it to a
  `.js` file first).
- Behaviour: ad-hoc Playwright scripts (Chromium is preinstalled in the Claude Code cloud environment; Playwright
  at `/opt/node-tools/node_modules/playwright`). Mock external services with `page.route`: serve the supabase-js
  UMD build (`npm install @supabase/supabase-js@2.117.2` in a scratch dir → `dist/umd/supabase.js`) for the jsDelivr
  URL, and fake `https://<ref>.supabase.co/{rest,auth,storage}/v1/...` and the Apps Script URL. Always check
  phone (390px) and desktop widths, `reducedMotion: 'reduce'`, and that
  `document.documentElement.scrollWidth - innerWidth === 0`.
- In that cloud environment the network policy blocked supabase.co, script.google.com and github.io, so real
  end-to-end checks have to be done by the owner.

## Architecture

### Script loading (`index.html`, end of body)
1. Inline `<head>` script adds `js-anim` to `<html>` unless `prefers-reduced-motion: reduce`. Every animation
   (CSS and JS) is gated on it; `main.js` reads it as `ANIMATE`.
2. `config.js` → `window.SAKHO_CONFIG` (Supabase URL, publishable key, admin email).
3. supabase-js UMD from jsDelivr, pinned to 2.117.2.
4. `main.js` — classic script; its top-level functions/vars are globals.
5. `admin.js` — IIFE that relies on main.js globals (`setProducts`, `renderProducts`, `PRODUCTS`, `PRODUCT_BY_ID`,
   `imgSrc`, `escapeHtml`). Load order matters.

### Products (Supabase)
- `DEFAULT_PRODUCTS` in `main.js` is only a fallback (shown first, and if Supabase is unconfigured/unreachable).
- `admin.js` reads table `products` and calls `setProducts(list, true)`. Row → object mapping:
  `description→desc`, `category→cat`, `image_url→img`, `sort_order→sort`. Updates: Realtime `postgres_changes`
  subscription plus `visibilitychange`, both through a debounced reload. `setProducts(..., true)` also prunes cart
  lines whose product no longer exists.
- `imgSrc()` only allows `https://` URLs, `assets/...` paths or bare file names under `assets/img/`.
- Schema, RLS, Realtime publication, Storage bucket and seed data live in `supabase/setup.sql` (idempotent; run
  by hand in the Supabase SQL editor). Writes are authorised by `public.is_admin()`, which checks the JWT email
  against table `public.admins`. Reads are public. `config.js` holds only the **publishable** key.
- Photos: compressed in the browser (`compressImage`: max 800px, JPEG 0.8), uploaded to bucket `products` with a
  unique name and a 1-year `cacheControl`; replaced/deleted photos are removed from Storage. Free-tier **egress**
  is the main quota risk (another project of the owner was restricted for exceeding it) — keep images small.

### Admin mode
- Entry points: discreet lock button `#adminKey` right after the footer copyright (kept away from the bottom-right
  corner where the floating WhatsApp button sits on mobile), or `#admin` in the URL.
- Password-only form; the email is `ADMIN_EMAIL` from `config.js` (`signInWithPassword`). The password exists only
  in Supabase Auth (Authentication → Users), never in the repo.
- `body.is-admin` reveals the per-card edit/delete tools (rendered for every card by `renderProducts`, hidden by
  CSS) and the bottom admin bar. Click handling is delegated on `#products`.

### Categories — keep in sync
The six slugs (`smartphones, ordinateurs, accessoires, audio, montres, chargeurs`) are hardcoded in:
`index.html` (filter chips `.chip[data-filter]`, rail cards `.cat[data-filter]`, editor `<select id="productCategory">`),
`main.js` `CATEGORIES`, and the CHECK constraint on `products.category` in `supabase/setup.sql`. Adding a category
also requires an `ALTER TABLE` run in the live Supabase project.

### Cart & orders
- Cart: `localStorage['sakho-cart']`, per visitor (intentional).
- Checkout POSTs JSON with `Content-Type: text/plain` (avoids a CORS preflight Apps Script can't answer) to the
  Google Apps Script web app `ORDER_ENDPOINT` (in `main.js`). `apps-script/Code.gs` validates, appends a row to the
  "Commandes" sheet and emails the seller (MailApp; `NOTIFY_EMAIL` empty = script owner). On failure the UI offers
  a prefilled WhatsApp message.
- Client and server validation must stay in sync: Senegal phone regex, order id `SAK-YYYYMMDD-NNNN`, payment list.
- `Code.gs` changes are **not** deployed by git: paste into the Apps Script editor, then Deploy → Manage deployments
  → edit → **New version** (keeps the `/exec` URL). Owner pitfalls: do it in a private window with a single Google
  account, and tick "Select all" on the OAuth screen (see `apps-script/INSTRUCTIONS.md`).

### Animations (`main.js` + `style.css`)
- `initAnimations()` adds `.reveal` classes to selector groups, observes them, and removes the classes after the
  `transform` transition so `.tilt` (mouse-only 3D hover via `--rx/--ry/--ty`) can take over. `main` has
  `overflow-x: clip` so lateral reveals never widen the page on phones.
- `initCategoryRail()` (runs before `initAnimations`): clones the category cards for an infinite loop and drifts
  `scrollLeft` with requestAnimationFrame; pauses on hover/touch/wheel/focus and when off-screen. With reduced motion:
  no clones, `.is-static` snap rail. `.cat` clicks are delegated on `document` so clones work too.
- Fly-to-cart, marquee brands, scroll progress bar and hero parallax are in the same file.

## Per-shop configuration
To rebrand for another shop: `assets/js/config.js` (Supabase URL/key, `ADMIN_EMAIL`), `main.js`
(`WHATSAPP_NUMBER`, `ORDER_ENDPOINT`), phone numbers and address repeated in several places in `index.html`
(topbar, contact, footer — grep for them), logo/images in `assets/img/`, `SHOP_NAME`/`NOTIFY_EMAIL` in `Code.gs`,
and the admin email seeded in `supabase/setup.sql`. Each shop should get its own Google and Supabase accounts
(free-tier quotas are per Supabase organization). Owner-facing guides: `supabase/INSTRUCTIONS.md`,
`apps-script/INSTRUCTIONS.md`.
