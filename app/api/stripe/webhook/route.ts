import type Stripe from "stripe";
import { proEnabled, proSettings } from "@/lib/pro/config";
import { notFoundResponse } from "@/lib/pro/http";
import { accountMetadataKey, stripeClient, syncSubscription } from "@/lib/pro/stripe";

export const dynamic = "force-dynamic";

// Stripe sends every event on the account to every endpoint that asked for that event type,
// including the necklace shop's checkouts. Only objects tagged bv_account are BuilderVault's.
export async function POST(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  const { stripeWebhookSecret } = proSettings();
  if (!stripeWebhookSecret) {
    console.error("Stripe webhook: STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Server misconfigured", { status: 500 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(payload, request.headers.get("stripe-signature") ?? "", stripeWebhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature check failed:", (error as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.metadata?.[accountMetadataKey]) break;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (subscriptionId) await syncSubscription(subscriptionId);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        if (!subscription.metadata?.[accountMetadataKey]) break;
        await syncSubscription(subscription.id);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    // Answer 500 so Stripe retries; it keeps retrying for up to three days.
    console.error("Stripe webhook " + event.type + " failed:", (error as Error).message);
    return new Response("Webhook handling failed", { status: 500 });
  }

  return Response.json({ received: true });
}
