import { baseUrl, proEnabled, proSettings } from "@/lib/pro/config";
import { sendSignInEmail } from "@/lib/pro/email";
import { clientIp, isSameOrigin, notFoundResponse, readBody, redirectTo } from "@/lib/pro/http";
import { allow } from "@/lib/pro/limits";
import { createSignInToken, isValidEmail, normalizeEmail, safeNextPath } from "@/lib/pro/tokens";

const fifteenMinutes = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  if (!isSameOrigin(request)) return redirectTo("/sign-in?error=expired");

  const body = await readBody(request);
  const email = normalizeEmail(body.email);
  const next = safeNextPath(body.next);
  const nextQuery = next === "/account" ? "" : "&next=" + encodeURIComponent(next);

  if (!isValidEmail(email)) return redirectTo("/sign-in?error=email" + nextQuery);
  if (!allow("ip:" + clientIp(request), 10, fifteenMinutes) || !allow("email:" + email, 3, fifteenMinutes)) {
    return redirectTo("/sign-in?error=limit" + nextQuery);
  }

  const { sessionSecret } = proSettings();
  if (sessionSecret.length < 32) {
    console.error("Pro sign-in: SESSION_SECRET is missing or shorter than 32 characters");
    return redirectTo("/sign-in?error=unavailable" + nextQuery);
  }

  const token = createSignInToken(email, next, sessionSecret);
  // The link opens a confirm page instead of signing in straight away, because work email
  // scanners open links before people do and would use up a one-time link.
  const link = baseUrl() + "/sign-in/confirm#token=" + encodeURIComponent(token);
  try {
    await sendSignInEmail(email, link);
  } catch (error) {
    console.error("Pro sign-in email failed:", (error as Error).message);
    return redirectTo("/sign-in?error=unavailable" + nextQuery);
  }
  return redirectTo("/sign-in?sent=1");
}
