import { proEnabled } from "@/lib/pro/config";
import { isSameOrigin, notFoundResponse, redirectTo } from "@/lib/pro/http";
import { sessionCookieName, sessionCookieOptions } from "@/lib/pro/session";

export async function POST(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  if (!isSameOrigin(request)) return redirectTo("/account");
  const response = redirectTo("/");
  response.cookies.set(sessionCookieName, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
