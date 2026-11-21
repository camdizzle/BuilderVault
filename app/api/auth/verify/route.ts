import { proEnabled, proSettings } from "@/lib/pro/config";
import { isSameOrigin, notFoundResponse, readBody, redirectTo } from "@/lib/pro/http";
import { claimLinkOnce } from "@/lib/pro/limits";
import { sessionCookieName, sessionCookieOptions } from "@/lib/pro/session";
import { updateAccount } from "@/lib/pro/store";
import { createSessionToken, readSignInToken } from "@/lib/pro/tokens";

export async function POST(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  if (!isSameOrigin(request)) return redirectTo("/sign-in?error=expired");

  const { sessionSecret } = proSettings();
  const body = await readBody(request);
  const link = readSignInToken(body.token, sessionSecret);
  if (!link || !claimLinkOnce(link.nonce, link.expiresAt)) return redirectTo("/sign-in?error=expired");

  try {
    // Creates the account file on first sign-in.
    await updateAccount(link.email, () => undefined);
  } catch (error) {
    console.error("Pro sign-in: could not save the account:", (error as Error).message);
    return redirectTo("/sign-in?error=unavailable");
  }

  const response = redirectTo(link.next);
  response.cookies.set(sessionCookieName, createSessionToken(link.email, sessionSecret), sessionCookieOptions());
  return response;
}
