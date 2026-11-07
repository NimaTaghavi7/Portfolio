type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/**
 * Small in-process fixed-window rate limiter.
 *
 * This is intentionally dependency-free. On serverless platforms each warm
 * instance keeps its own counters; for a single-admin portfolio this is a
 * meaningful layer of protection on top of validation. A shared store
 * (Upstash/Redis) can replace it later without changing call sites.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();

  // Opportunistic cleanup so a long-lived process cannot grow unbounded.
  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const allowed = existing.count <= limit;

  return {
    allowed,
    remaining,
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

/**
 * Best-effort client IP extraction behind common proxies.
 *
 * Platform headers are preferred. For a generic `X-Forwarded-For`, the last
 * hop is used because it is appended by the closest trusted proxy; the first
 * value is attacker-controlled on many deployments.
 */
export function getClientIp(headers: Headers): string {
  const platformIp =
    headers.get("x-vercel-forwarded-for") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-nf-client-connection-ip");

  if (platformIp) return platformIp.split(",")[0]?.trim().slice(0, 64) || "unknown";

  // Generic proxies append the real client as the last hop. The first value
  // is commonly attacker-controlled.
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    return hops[hops.length - 1]?.slice(0, 64) || "unknown";
  }

  return headers.get("x-real-ip")?.slice(0, 64) || "unknown";
}

/** Cleanup helper for long-running processes (called opportunistically). */
export function pruneRateLimitBuckets() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
