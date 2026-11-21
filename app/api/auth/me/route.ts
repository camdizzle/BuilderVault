import { proEnabled } from "@/lib/pro/config";
import { jsonNoStore } from "@/lib/pro/http";
import { currentViewer } from "@/lib/pro/session";

export const dynamic = "force-dynamic";

/** What the header and the tools need to know: is Pro on, who is signed in, and are they Pro. */
export async function GET() {
  if (!proEnabled()) return jsonNoStore({ enabled: false, signedIn: false, pro: false });
  try {
    const viewer = await currentViewer();
    return jsonNoStore({ enabled: true, signedIn: Boolean(viewer), pro: Boolean(viewer?.pro), email: viewer?.email ?? null });
  } catch (error) {
    console.error("Pro status check failed:", (error as Error).message);
    return jsonNoStore({ enabled: true, signedIn: false, pro: false, email: null });
  }
}
