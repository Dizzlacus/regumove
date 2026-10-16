# regumove

Bare-bones static site, using the same shape as King's Chair: Astro pages, content in data files, and a Cloudflare Worker that redirects `www` and `http` to the canonical URL before serving static assets.

## Local development

```bash
pnpm install
pnpm run dev
```

Open the URL Astro prints (usually http://localhost:4321).

```bash
pnpm run build       # production build → dist/
pnpm run preview     # preview the production build locally
pnpm run preview:cf  # build + preview via Wrangler (Cloudflare)
```

## Deploy (Cloudflare Workers)

| Setting | Value |
|--------|--------|
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy --config wrangler.jsonc --no-autoconfig` |
| Root directory | `/` (repo root) |

`--no-autoconfig` is required so Wrangler does not treat this as an Astro SSR app.

Before the first custom-domain deploy:

1. Set `site` in `astro.config.mjs`.
2. Set `CANONICAL_HOST` in `src/worker.ts` to the same apex host.
3. Uncomment and update `routes` in `wrangler.jsonc` for both the apex and `www`.

## Enquiry delivery

The contact form posts to `/api/enquire`, handled by the Worker (`src/worker.ts` → `src/lib/enquire.ts`). It emails each enquiry through [Resend](https://resend.com) and only reports success once Resend accepts the message. Until all three variables below are set it replies "online enquiries aren't available yet" (HTTP 503) and nothing is sent. The API key stays server-side.

| Variable | Kind | Value |
|--------|--------|--------|
| `RESEND_API_KEY` | Secret | `npx wrangler secret put RESEND_API_KEY` |
| `ENQUIRY_TO_EMAIL` | Variable | The owner's confirmed inbox (comma-separate several) |
| `ENQUIRY_FROM_EMAIL` | Variable | A sender on a domain verified in Resend, e.g. `ReguMove website <enquiries@your-domain>` |

Set the two plain variables under `vars` in `wrangler.jsonc` or in the Cloudflare dashboard. For `pnpm run preview:cf`, put all three in `.dev.vars` (git-ignored). `pnpm run dev` (Astro only) has no Worker, so the form shows its failure message there.

## Where to edit

- Name, page title, meta description, strapline: `src/data/business.ts`
- Nav links: `src/data/nav.ts`
- Products (copy, icon, CTA label, renders, alt text, placeholder label): `src/data/products.ts`. A product without `visual` shows its `placeholderLabel` on a placeholder slab.
- Enquiry fields and messages: `src/data/enquiry.ts` (validation shared by browser and Worker in `src/lib/validate-enquiry.ts`)
- Colours, type scale and spacing tokens: `src/styles/global.css`
- Section copy: `src/components/` (`Hero`, `Why`, `ProductRange`, `About`, `Contact`, `Footer`)
- Photos: import from `src/assets/images/` with `Picture`/`Image` from `astro:assets` (`sharp` is already installed)

## Product section

`src/components/ProductRange.astro` (section `#products`) renders one `ProductStory.astro` row per entry in `src/data/products.ts`; it is mounted in `src/pages/index.astro`. Styles live in the "Products" block of `src/styles/global.css` (Tailwind v4, CSS-first; breakpoints 810px and 1200px) and reuse the shared `.btn` and `.eyebrow`. No client JavaScript. Every button links to `#contact`, which `Contact.astro` supplies. Rows alternate from 810px via CSS `order`; text stays first in the DOM so phones read text before the visual. Pinch Node still uses a placeholder: add a `visual` once a real render exists.

## GitHub Pages preview

A noindexed preview is published to https://dizzlacus.github.io/regumove/ by `.github/workflows/deploy-pages.yml` on every push to `main` (or run it manually from the Actions tab). `pnpm run build:pages` builds it locally: it sets `GITHUB_PAGES=true`, which switches `site` to `https://dizzlacus.github.io` and `base` to `/regumove`, adds `noindex, nofollow` to every page, makes `robots.txt` disallow everything, drops the sitemap and shows a "Preview draft" note in the footer. Links and assets go through `withBase()` in `src/lib/url.ts`. The normal `pnpm run build` / `deploy` for regumove.com is unaffected.

The preview has no Worker, so **the contact form won't send there**; it shows its failure message, as in `pnpm run dev`.

To publish:

```bash
git init
git add .
git commit -m "Add GitHub Pages preview"
git branch -M main
git remote add origin https://github.com/Dizzlacus/regumove.git
git push -u origin main
```
