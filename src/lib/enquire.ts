import { HONEYPOT_FIELD, enquiryMessages, roleLabel } from "../data/enquiry";
import { validateEnquiry, type EnquiryValues } from "./validate-enquiry";

/**
 * POST /api/enquire, called by src/worker.ts.
 *
 * Accepts JSON (the enhanced form) or a plain form post (no JS). Delivers by email through
 * Resend's HTTP API. Success is only reported after Resend confirms the send; if delivery
 * isn't configured, it says so (503) rather than pretending. See README "Enquiry delivery".
 */
export interface EnquiryEnv {
  RESEND_API_KEY?: string;
  ENQUIRY_TO_EMAIL?: string;
  ENQUIRY_FROM_EMAIL?: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function page(title: string, message: string, status: number, details: string[] = []) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${escapeHtml(title)} | ReguMove</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; font: 400 1.125rem/1.6 "Source Sans 3", system-ui, sans-serif; background: #f8f3eb; color: #333536; }
    main { max-width: 36rem; margin: 0 auto; padding: 5rem 1.5rem; }
    h1 { margin: 0 0 1rem; font: 600 2rem/1.05 "Outfit", system-ui, sans-serif; letter-spacing: -0.02em; color: #082912; }
    a { color: #082912; font-weight: 600; text-underline-offset: 0.2em; }
    a:focus-visible { outline: 2px solid #082912; outline-offset: 3px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>${details.length ? `
    <ul>${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>` : ""}
    <p><a href="/#contact">Back to ReguMove</a></p>
  </main>
</body>
</html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

const json = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

function reply(request: Request, status: number, body: { ok: boolean; message: string; errors?: Record<string, string | undefined> }) {
  const accept = request.headers.get("accept") || "";
  const wantsJson = accept.includes("application/json") || (request.headers.get("content-type") || "").includes("json");
  if (wantsJson) return json(body, status);
  // No highlighted fields on the fallback page, so spell out each problem.
  const details = Object.values(body.errors ?? {}).filter((detail): detail is string => Boolean(detail));
  return page(body.ok ? "Thank you" : "Enquiry not sent", body.message, status, details);
}

/** Collapses control and line-separator characters, so single-line values can't add header-like lines. */
const singleLine = (value: string) => value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, " ").trim();

const MAX_BODY_BYTES = 16 * 1024;
type ReadResult = { values: EnquiryValues & { honeypot: string } } | { error: 400 | 413 };

/** Reads the body with a hard size cap, whether or not content-length is sent. */
async function readCapped(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (declared > MAX_BODY_BYTES) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function readValues(request: Request): Promise<ReadResult> {
  const text = await readCapped(request);
  if (text === null) return { error: 413 };
  try {
    const type = request.headers.get("content-type") || "";
    let get: (key: string) => string;
    if (type.includes("application/json")) {
      const raw = JSON.parse(text) as Record<string, unknown>;
      get = (key) => (typeof raw?.[key] === "string" ? (raw[key] as string).trim() : "");
    } else if (type.includes("application/x-www-form-urlencoded")) {
      const form = new URLSearchParams(text);
      get = (key) => (form.get(key) ?? "").trim();
    } else {
      return { error: 400 };
    }
    return {
      values: {
        name: get("name"),
        email: get("email"),
        role: get("role"),
        organisation: get("organisation"),
        message: get("message"),
        honeypot: get(HONEYPOT_FIELD),
      },
    };
  } catch {
    return { error: 400 };
  }
}

export async function handleEnquiry(request: Request, env: EnquiryEnv): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (originHost !== new URL(request.url).host) {
      return reply(request, 403, { ok: false, message: enquiryMessages.failure });
    }
  }

  const read = await readValues(request);
  if ("error" in read) return reply(request, read.error, { ok: false, message: enquiryMessages.failure });
  const { values } = read;

  // Honeypot: quietly drop bot submissions. Never reported as delivered.
  if (values.honeypot) return reply(request, 400, { ok: false, message: enquiryMessages.failure });

  const errors = validateEnquiry(values);
  if (Object.keys(errors).length) {
    return reply(request, 422, { ok: false, message: enquiryMessages.invalid, errors });
  }

  const { RESEND_API_KEY, ENQUIRY_TO_EMAIL, ENQUIRY_FROM_EMAIL } = env;
  if (!RESEND_API_KEY || !ENQUIRY_TO_EMAIL || !ENQUIRY_FROM_EMAIL) {
    console.error("Enquiry not delivered: RESEND_API_KEY, ENQUIRY_TO_EMAIL and ENQUIRY_FROM_EMAIL must all be set.");
    return reply(request, 503, { ok: false, message: enquiryMessages.unavailable });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: ENQUIRY_FROM_EMAIL,
        to: ENQUIRY_TO_EMAIL.split(",").map((address) => address.trim()),
        reply_to: values.email,
        subject: `Website enquiry from ${singleLine(values.name)}`,
        text: [
          `Name: ${singleLine(values.name)}`,
          `Email: ${values.email}`,
          `I am a: ${roleLabel(values.role)}`,
          `School or organisation: ${singleLine(values.organisation) || "(not given)"}`,
          "",
          "Message:",
          // Quoted line by line, so the sender's text can't pass for one of the field lines above.
          values.message.split(/\r\n|\r|\n/).map((line) => `> ${line}`).join("\n"),
          "",
        ].join("\n"),
      }),
    });
    if (!response.ok) {
      console.error(`Enquiry not delivered: Resend responded ${response.status} ${await response.text()}`);
      return reply(request, 502, { ok: false, message: enquiryMessages.failure });
    }
  } catch (error) {
    console.error("Enquiry not delivered: could not reach Resend", error);
    return reply(request, 502, { ok: false, message: enquiryMessages.failure });
  }

  return reply(request, 200, { ok: true, message: enquiryMessages.success });
}
