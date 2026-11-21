import { proEnabled } from "@/lib/pro/config";
import { isSameOrigin, notFoundResponse, readBody, redirectTo } from "@/lib/pro/http";
import { currentViewer } from "@/lib/pro/session";
import { createCheckoutSession } from "@/lib/pro/stripe";

export async function POST(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  if (!isSameOrigin(request)) return redirectTo("/pro");

  const viewer = await currentViewer();
  if (!viewer) return redirectTo("/sign-in?next=/pro");
  // Already Pro (paid or complimentary): send them to their account instead of a second subscription.
  if (viewer.pro) return redirectTo("/account");

  const body = await readBody(request);
  const plan = body.plan === "yearly" ? "yearly" : "monthly";
  try {
    const url = await createCheckoutSession(viewer.email, plan);
    return new Response(null, { status: 303, headers: { Location: url } });
  } catch (error) {
    console.error("Pro checkout failed:", (error as Error).message);
    return redirectTo("/pro?error=checkout");
  }
}
