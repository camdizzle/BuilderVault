// Signed tokens for BuilderVault Pro: the session cookie and the one-time sign-in link.
// Pure Node code with no Next.js imports, so the tests can load it directly.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;
export const signInLinkLifetimeMs = 15 * 60 * 1000;

type TokenPurpose = "session" | "sign-in";

export type SessionToken = { email: string; expiresAt: number };
export type SignInToken = { email: string; expiresAt: number; nonce: string; next: string };

function base64url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function signature(purpose: TokenPurpose, body: string, secret: string) {
  return createHmac("sha256", secret).update(purpose + "." + body).digest("base64url");
}

function sign(purpose: TokenPurpose, payload: Record<string, unknown>, secret: string) {
  const body = base64url(JSON.stringify(payload));
  return body + "." + signature(purpose, body, secret);
}

function verify(purpose: TokenPurpose, token: string, secret: string, now: number): Record<string, unknown> | null {
  if (!secret || typeof token !== "string") return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const expected = Buffer.from(signature(purpose, body, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload || typeof payload !== "object") return null;
    if (typeof payload.x !== "number" || payload.x <= now) return null;
    if (typeof payload.e !== "string" || !isValidEmail(payload.e)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Only same-site paths are allowed after sign-in, so a link can't bounce people to another site. */
export function safeNextPath(value: unknown, fallback = "/account") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (value.length > 200) return fallback;
  return value;
}

export function createSessionToken(email: string, secret: string, now = Date.now()) {
  return sign("session", { e: normalizeEmail(email), x: now + sessionLifetimeMs }, secret);
}

export function readSessionToken(token: string | undefined, secret: string, now = Date.now()): SessionToken | null {
  if (!token) return null;
  const payload = verify("session", token, secret, now);
  return payload ? { email: payload.e as string, expiresAt: payload.x as number } : null;
}

export function createSignInToken(email: string, next: string, secret: string, now = Date.now()) {
  return sign("sign-in", { e: normalizeEmail(email), x: now + signInLinkLifetimeMs, n: randomBytes(12).toString("base64url"), p: safeNextPath(next) }, secret);
}

export function readSignInToken(token: string | undefined, secret: string, now = Date.now()): SignInToken | null {
  if (!token) return null;
  const payload = verify("sign-in", token, secret, now);
  if (!payload || typeof payload.n !== "string") return null;
  return { email: payload.e as string, expiresAt: payload.x as number, nonce: payload.n, next: safeNextPath(payload.p) };
}
