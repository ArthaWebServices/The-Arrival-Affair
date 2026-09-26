/**
 * In-memory rate limiter using a sliding window algorithm.
 * No external dependencies (no Redis required).
 * Works on Vercel serverless — resets per cold start (acceptable for most use cases).
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

// Global store — persists across requests in the same serverless instance
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstRequest > windowMs) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;   // true = allowed, false = blocked
  remaining: number;  // requests remaining in window
  resetInMs: number;  // ms until the window resets
  limit: number;      // max requests allowed
}

export interface RateLimitOptions {
  /** Unique key prefix e.g. 'login', 'interest-form' */
  prefix: string;
  /** IP address of the requester */
  ip: string;
  /** Max requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export function rateLimit({
  prefix,
  ip,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  cleanup(windowMs);

  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  // First request or window has expired — reset the counter
  if (!entry || now - entry.firstRequest > windowMs) {
    store.set(key, { count: 1, firstRequest: now });
    return {
      success: true,
      remaining: limit - 1,
      resetInMs: windowMs,
      limit,
    };
  }

  // Within the window and under the limit
  if (entry.count < limit) {
    entry.count++;
    store.set(key, entry);
    return {
      success: true,
      remaining: limit - entry.count,
      resetInMs: windowMs - (now - entry.firstRequest),
      limit,
    };
  }

  // Limit exceeded — reject
  return {
    success: false,
    remaining: 0,
    resetInMs: windowMs - (now - entry.firstRequest),
    limit,
  };
}

// ─── Pre-configured limiters ─────────────────────────────────────────────────

/**
 * 3 submissions per IP per 10 minutes.
 * Protects the public volunteer interest/application form from spam.
 */
export function interestFormLimiter(ip: string) {
  return rateLimit({
    prefix: 'interest-form',
    ip,
    limit: 3,
    windowMs: 10 * 60 * 1000,
  });
}

/**
 * 5 attempts per IP per 15 minutes.
 * Protects the admin login route against brute-force attacks.
 */
export function loginLimiter(ip: string) {
  return rateLimit({
    prefix: 'login',
    ip,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
}

/**
 * 60 requests per IP per minute.
 * General protection for all other public API routes.
 */
export function generalApiLimiter(ip: string) {
  return rateLimit({
    prefix: 'general-api',
    ip,
    limit: 60,
    windowMs: 60 * 1000,
  });
}
