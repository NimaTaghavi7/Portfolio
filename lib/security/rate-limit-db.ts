import crypto from "node:crypto";

import { prisma } from "@/lib/db/prisma";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/** Hashes a rate-limit subject so raw emails/IPs are never stored. */
export function hashRateLimitKey(prefix: string, value: string) {
  return crypto
    .createHash("sha256")
    .update(`${prefix}:${value}:${process.env.NEXTAUTH_SECRET ?? "rate-limit"}`)
    .digest("hex");
}

/**
 * Atomic fixed-window limiter backed by PostgreSQL.
 *
 * A single INSERT ... ON CONFLICT statement makes the counter safe across
 * concurrent requests and multiple serverless instances. The table is pruned
 * opportunistically; expired rows are harmless and can also be removed by a
 * cron job in production.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const nextReset = new Date(now.getTime() + windowMs);

  const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${nextReset})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."resetAt" <= ${now} THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimit"."resetAt" <= ${now} THEN ${nextReset}
        ELSE "RateLimit"."resetAt"
      END
    RETURNING "count", "resetAt"
  `;

  const row = rows[0];
  const count = Number(row?.count ?? 1);
  const resetAt = row?.resetAt ? new Date(row.resetAt) : nextReset;
  const allowed = count <= limit;

  // Keep the table from growing without bound. Best-effort only.
  if (Math.random() < 0.02) {
    prisma.rateLimit
      .deleteMany({ where: { resetAt: { lt: now } } })
      .catch((error: unknown) => console.error("Rate limit cleanup failed", error));
  }

  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)),
  };
}
