import type { APIRoute } from "astro";
import { withBase } from "../../lib/url";

// Generated (rather than a static file in public/) so start_url and icon paths include the base on the
// GitHub Pages preview. Production output is identical to the former hand-written file.
const manifest = `{
  "name": "ReguMove",
  "short_name": "ReguMove",
  "start_url": "${withBase("/")}",
  "display": "standalone",
  "theme_color": "#f8f3eb",
  "background_color": "#f8f3eb",
  "icons": [
    { "src": "${withBase("/favicon.svg")}", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },
    { "src": "${withBase("/favicon/icon-192.png")}", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "${withBase("/favicon/icon-512.png")}", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "${withBase("/favicon/icon-192.png")}", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "${withBase("/favicon/icon-512.png")}", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
`;

export const GET: APIRoute = () =>
  new Response(manifest, { headers: { "content-type": "application/manifest+json" } });
