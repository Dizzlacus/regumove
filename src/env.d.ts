/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/** Worker bindings for enquiry delivery; merges with Env in worker-configuration.d.ts. See README "Enquiry delivery". */
interface Env {
  /** Secret: set with `npx wrangler secret put RESEND_API_KEY`. */
  RESEND_API_KEY?: string;
  /** Where enquiries are sent. Comma-separate several addresses. */
  ENQUIRY_TO_EMAIL?: string;
  /** Sender on a domain verified in Resend, e.g. "ReguMove website <enquiries@your-domain>". */
  ENQUIRY_FROM_EMAIL?: string;
}

/** Build-time flag defined in astro.config.mjs: true for the GitHub Pages preview build. */
declare const __PAGES_PREVIEW__: boolean;
