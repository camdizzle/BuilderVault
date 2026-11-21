// Reads the signed-in visitor from the session cookie, for server components and route handlers.
import { cookies } from "next/headers";
import { baseUrl, proEnabled, proSettings } from "./config";
import { isProAccount, type Account } from "./plan";
import { getAccount } from "./store";
import { readSessionToken, sessionLifetimeMs } from "./tokens";

export const sessionCookieName = "bv_session";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: baseUrl().startsWith("https://"),
    path: "/",
    maxAge: Math.floor(sessionLifetimeMs / 1000)
  };
}

export type Viewer = { email: string; account: Account | null; pro: boolean };

/** The signed-in visitor, or null. Always null while Pro is switched off. */
export async function currentViewer(): Promise<Viewer | null> {
  if (!proEnabled()) return null;
  const settings = proSettings();
  const store = await cookies();
  const session = readSessionToken(store.get(sessionCookieName)?.value, settings.sessionSecret);
  if (!session) return null;
  const account = await getAccount(session.email);
  return { email: session.email, account, pro: isProAccount(account, session.email, settings.compEmails) };
}
