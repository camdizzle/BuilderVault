// In-memory limits for the single BuilderVault server process: sign-in email rate limits
// and the list of sign-in links that were already used. Both reset when the app restarts,
// which is fine because links expire after 15 minutes anyway.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** True when the action is allowed; counts it. */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()) {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    sweep(now);
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

const usedLinks = new Map<string, number>();

/** Marks a sign-in link as used. Returns false if it was already used. */
export function claimLinkOnce(nonce: string, expiresAt: number, now = Date.now()) {
  if (usedLinks.has(nonce)) return false;
  usedLinks.set(nonce, expiresAt);
  sweep(now);
  return true;
}

function sweep(now: number) {
  if (buckets.size > 5000) for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  if (usedLinks.size > 5000) for (const [key, expiresAt] of usedLinks) if (expiresAt <= now) usedLinks.delete(key);
}
