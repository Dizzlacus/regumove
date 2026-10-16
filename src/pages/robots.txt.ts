import type { APIRoute } from "astro";
import { isPagesPreview, withBase } from "../lib/url";

const getRobotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

// The GitHub Pages preview is kept out of search engines entirely.
const previewRobotsTxt = `User-agent: *
Disallow: /
`;

export const GET: APIRoute = ({ site }) => {
  if (isPagesPreview) return new Response(previewRobotsTxt);
  const sitemapURL = new URL(withBase("/sitemap-index.xml"), site);
  return new Response(getRobotsTxt(sitemapURL));
};
