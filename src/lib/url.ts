/** Base path with a trailing slash: "/" in production, "/regumove/" on the GitHub Pages preview. */
const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");

/** Prefixes a root-relative path with the base, e.g. withBase("/privacy") → "/regumove/privacy" on the preview. */
export const withBase = (path = "/") => base + path.replace(/^\//, "");

/** True only in the GitHub Pages preview build (GITHUB_PAGES=true, see astro.config.mjs). */
export const isPagesPreview: boolean = __PAGES_PREVIEW__;
