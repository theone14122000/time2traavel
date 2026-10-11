import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const EXCLUDED_IPS = new Set(
  (process.env.RATE_LIMIT_EXCLUDE ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean),
);

/**
 * Dependency-free sliding-window rate limiter.
 * Note: in-memory state resets on serverless cold starts — good protection
 * against casual spam; swap for a Redis/Upstash store at very high traffic.
 */
export function rateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
  ip?: string | null;
}): { success: boolean; remaining: number; retryAfterSeconds: number } {
  const ip = options.ip?.trim();
  if (ip && EXCLUDED_IPS.has(ip)) {
    return { success: true, remaining: options.limit, retryAfterSeconds: 0 };
  }

  const now = Date.now();
  const bucketKey = `${options.key}:${ip ?? "global"}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      remaining: options.limit - 1,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (bucket.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1),
    };
  }

  bucket.count += 1;
  return {
    success: true,
    remaining: options.limit - bucket.count,
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/** Opportunistic cleanup so the map never grows unbounded. */
export function pruneRateLimit(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export async function getClientIp(headers: Headers): Promise<string | null> {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return headers.get("x-real-ip");
}
