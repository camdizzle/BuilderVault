import { proEnabled } from "@/lib/pro/config";
import { isSameOrigin, notFoundResponse, redirectTo } from "@/lib/pro/http";
import { currentViewer } from "@/lib/pro/session";
import { createPortalSession } from "@/lib/pro/stripe";

export async function POST(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  if (!isSameOrigin(request)) return redirectTo("/account");

  const viewer = await currentViewer();
  if (!viewer) return redirectTo("/sign-in?next=/account");
  const customerId = viewer.account?.stripeCustomerId;
  if (!customerId) return redirectTo("/account?error=no-billing");
  try {
    const url = await createPortalSession(customerId);
    return new Response(null, { status: 303, headers: { Location: url } });
  } catch (error) {
    console.error("Pro billing portal failed:", (error as Error).message);
    return redirectTo("/account?error=portal");
  }
}
