import { handleEnquiry } from "./lib/enquire";

const CANONICAL_HOST = "regumove.com";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/enquire" && request.method === "POST") {
      return handleEnquiry(request, env);
    }

    const isWww = url.hostname === `www.${CANONICAL_HOST}`;
    const isInsecureApex = url.hostname === CANONICAL_HOST && url.protocol === "http:";

    if (isWww || isInsecureApex) {
      const target = new URL(`${url.pathname}${url.search}`, CANONICAL_ORIGIN);
      return Response.redirect(target.href, 301);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
