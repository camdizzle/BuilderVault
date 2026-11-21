// Small helpers shared by the Pro route handlers.
import { NextResponse } from "next/server";
import { baseUrl } from "./config";

/** A 303 redirect to a path on this site, so a form POST lands on a normal page. */
export function redirectTo(pathWithQuery: string) {
  return NextResponse.redirect(baseUrl() + pathWithQuery, 303);
}

export function notFoundResponse() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function jsonNoStore(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: { "Cache-Control": "no-store" } });
}

/** Rejects requests sent from another site. Browsers send Origin on every POST, PUT and DELETE. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const allowed = new URL(baseUrl()).origin;
    const requestOrigin = new URL(request.url).origin;
    return origin === allowed || origin === requestOrigin;
  } catch {
    return false;
  }
}

export function clientIp(request: Request) {
  return (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Reads a form post or a JSON body into a plain object of strings. */
export async function readBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const data = await request.json();
      return Object.fromEntries(Object.entries(data ?? {}).map(([key, value]) => [key, String(value)]));
    }
    const form = await request.formData();
    return Object.fromEntries([...form.entries()].map(([key, value]) => [key, typeof value === "string" ? value : ""]));
  } catch {
    return {};
  }
}
