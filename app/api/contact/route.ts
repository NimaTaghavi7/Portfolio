import crypto from "crypto";

import { prisma } from "@/lib/db/prisma";
import { sendContactNotification } from "@/lib/email/sendContactNotification";
import { getClientIp } from "@/lib/security/rate-limit";
import {
  consumeRateLimit,
  hashRateLimitKey,
} from "@/lib/security/rate-limit-db";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;
const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT = 8;
const EMAIL_LIMIT = 3;

type Payload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  locale?: unknown;
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(data, { ...init, headers });
}

function asTrimmedString(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, health checks)
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * Reads a JSON body with a hard byte limit. `Content-Length` is checked first,
 * then the stream is bounded because clients can omit or lie about it.
 */
async function readJsonBody(
  request: Request
): Promise<{ payload: Payload } | { error: "too_large" | "invalid_json" }> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { error: "too_large" };
  }

  if (!request.body) return { error: "invalid_json" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return { error: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { error: "invalid_json" };
  }

  try {
    const text = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString(
      "utf8"
    );
    return { payload: JSON.parse(text) as Payload };
  } catch {
    return { error: "invalid_json" };
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ ok: false, code: "forbidden" }, { status: 403 });
  }

  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    return json({ ok: false, code: "unsupported_media_type" }, { status: 415 });
  }

  const ip = getClientIp(request.headers);

  // Broad IP limit before parsing so malformed-request floods are bounded too.
  let ipLimit;
  try {
    ipLimit = await consumeRateLimit(
      hashRateLimitKey("contact-ip", ip),
      IP_LIMIT,
      IP_WINDOW_MS
    );
  } catch (error) {
    console.error("Contact IP rate limiter failed", error);
    return json({ ok: false, code: "service_unavailable" }, { status: 503 });
  }

  if (!ipLimit.allowed) {
    return json(
      { ok: false, code: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await readJsonBody(request);
  if ("error" in body) {
    return json(
      { ok: false, code: body.error },
      { status: body.error === "too_large" ? 413 : 400 }
    );
  }

  const payload = body.payload;

  // Honeypot: silently accept so bots do not learn anything. It still counts
  // against the IP limit above.
  if (asTrimmedString(payload.website, 200)) {
    return json({ ok: true, emailSent: false });
  }

  const name = asTrimmedString(payload.name, 120);
  const email = asTrimmedString(payload.email, 254).toLowerCase();
  const subject = asTrimmedString(payload.subject, 100).replace(/[\r\n]+/g, " ");
  const message = asTrimmedString(payload.message, 5000);
  const locale = payload.locale === "fa" ? "fa" : "en";

  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "invalid";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fields.email = "invalid";
  if (subject.length < 2) fields.subject = "invalid";
  if (message.length < 10) fields.message = "invalid";

  if (Object.keys(fields).length > 0) {
    return json({ ok: false, code: "validation", fields }, { status: 400 });
  }

  let emailLimit;
  try {
    emailLimit = await consumeRateLimit(
      hashRateLimitKey("contact-email", email),
      EMAIL_LIMIT,
      IP_WINDOW_MS
    );
  } catch (error) {
    console.error("Contact email rate limiter failed", error);
    return json({ ok: false, code: "service_unavailable" }, { status: 503 });
  }

  if (!emailLimit.allowed) {
    return json(
      { ok: false, code: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(emailLimit.retryAfterSeconds, 60)
          ),
        },
      }
    );
  }

  const ipHash = crypto
    .createHash("sha256")
    .update(`${ip}:${process.env.NEXTAUTH_SECRET ?? "contact"}`)
    .digest("hex");

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        locale,
        ipHash,
        userAgent: (request.headers.get("user-agent") || "").slice(0, 300) || null,
      },
    });
  } catch (error) {
    console.error("Failed to store contact message", error);
    return json({ ok: false, code: "server_error" }, { status: 500 });
  }

  const emailSent = await sendContactNotification({
    name,
    email,
    subject,
    message,
  }).catch((error: unknown) => {
    console.error("Failed to send contact notification", error);
    return false;
  });

  return json({ ok: true, emailSent });
}
