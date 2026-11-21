import { proEnabled } from "@/lib/pro/config";
import { isSameOrigin, jsonNoStore, notFoundResponse } from "@/lib/pro/http";
import { cleanFormatterPrefs } from "@/lib/pro/plan";
import { currentViewer } from "@/lib/pro/session";
import { updateAccount } from "@/lib/pro/store";

export const dynamic = "force-dynamic";

/** The Power Fx formatter's saved style profile. Pro only. */
export async function GET() {
  if (!proEnabled()) return notFoundResponse();
  const viewer = await currentViewer();
  if (!viewer?.pro) return jsonNoStore({ error: "Pro required" }, { status: 403 });
  return jsonNoStore({ formatter: viewer.account?.prefs?.formatter ?? null });
}

export async function PUT(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  if (!isSameOrigin(request)) return jsonNoStore({ error: "Bad origin" }, { status: 403 });
  const viewer = await currentViewer();
  if (!viewer?.pro) return jsonNoStore({ error: "Pro required" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const formatter = cleanFormatterPrefs(body?.formatter);
  await updateAccount(viewer.email, (account) => {
    account.prefs = { ...(account.prefs ?? {}), formatter };
  });
  return jsonNoStore({ formatter });
}
