import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// GITHUB_PAGES=true (set by `pnpm run build:pages`) builds the noindexed GitHub Pages preview at
// https://dizzlacus.github.io/regumove/. Without it, this is the production build for regumove.com.
const isPagesPreview = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  // Update this to the live domain so sitemap and Open Graph URLs are absolute.
  site: isPagesPreview ? "https://dizzlacus.github.io" : "https://regumove.com",
  ...(isPagesPreview && { base: "/regumove" }),
  // /privacy is a noindexed draft awaiting approval: keep it out of the sitemap until it's approved.
  // The preview has no sitemap at all.
  integrations: isPagesPreview ? [] : [sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/privacy") })],
  vite: {
    plugins: [tailwindcss()],
    define: { __PAGES_PREVIEW__: JSON.stringify(isPagesPreview) },
  },
});
