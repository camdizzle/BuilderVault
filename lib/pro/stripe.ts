// Stripe calls for BuilderVault Pro: customers, Checkout, the customer portal, and syncing
// a subscription into the account file. Every BuilderVault object carries metadata
// bv_account, so events from other products on the same Stripe account are ignored.
import Stripe from "stripe";
import { baseUrl, proSettings } from "./config";
import { periodEndOf, type ProPlan, type StoredSubscription } from "./plan";
import { accountKey, getAccount, updateAccount, updateAccountByKey } from "./store";

export const accountMetadataKey = "bv_account";

let client: Stripe | null = null;
let clientKey = "";

export function stripeClient() {
  const { stripeSecretKey } = proSettings();
  if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!client || clientKey !== stripeSecretKey) {
    client = new Stripe(stripeSecretKey, { appInfo: { name: "BuilderVault" } });
    clientKey = stripeSecretKey;
  }
  return client;
}

export function priceFor(plan: ProPlan) {
  const { priceMonthly, priceYearly } = proSettings();
  return plan === "yearly" ? priceYearly : priceMonthly;
}

function planForPrice(priceId: string | undefined): ProPlan | null {
  if (!priceId) return null;
  const { priceMonthly, priceYearly } = proSettings();
  if (priceId === priceMonthly) return "monthly";
  if (priceId === priceYearly) return "yearly";
  return null;
}

/** Returns the account's Stripe customer, creating it the first time. */
export async function ensureCustomer(email: string) {
  const existing = await getAccount(email);
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;
  const customer = await stripeClient().customers.create({ email, metadata: { [accountMetadataKey]: accountKey(email) } });
  await updateAccount(email, (account) => {
    account.stripeCustomerId = account.stripeCustomerId ?? customer.id;
  });
  return (await getAccount(email))?.stripeCustomerId ?? customer.id;
}

export async function createCheckoutSession(email: string, plan: ProPlan) {
  const price = priceFor(plan);
  if (!price) throw new Error("Stripe price for " + plan + " is not set");
  const customer = await ensureCustomer(email);
  const key = accountKey(email);
  const session = await stripeClient().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: key,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    metadata: { [accountMetadataKey]: key },
    subscription_data: { metadata: { [accountMetadataKey]: key } },
    success_url: baseUrl() + "/account?checkout={CHECKOUT_SESSION_ID}",
    cancel_url: baseUrl() + "/pro"
  });
  if (!session.url) throw new Error("Stripe did not return a Checkout URL");
  return session.url;
}

export async function createPortalSession(customerId: string) {
  const session = await stripeClient().billingPortal.sessions.create({ customer: customerId, return_url: baseUrl() + "/account" });
  return session.url;
}

function toStored(subscription: Stripe.Subscription): StoredSubscription {
  const item = subscription.items?.data?.[0];
  return {
    id: subscription.id,
    status: subscription.status,
    plan: planForPrice(item?.price?.id),
    currentPeriodEnd: periodEndOf(subscription as unknown as Parameters<typeof periodEndOf>[0]),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end || subscription.cancel_at),
    updatedAt: Date.now()
  };
}

/**
 * Fetches the subscription fresh from Stripe and stores it on its account, so events that
 * arrive late or out of order can't leave an old status behind.
 * Returns false when the subscription doesn't belong to BuilderVault.
 */
export async function syncSubscription(subscriptionId: string) {
  const subscription = await stripeClient().subscriptions.retrieve(subscriptionId);
  const key = subscription.metadata?.[accountMetadataKey];
  if (!key) return false;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const stored = toStored(subscription);
  await updateAccountByKey(key, (account) => {
    // A customer can end up with an old cancelled subscription and a new active one.
    // Never let the cancelled one replace the active one.
    const current = account.subscription;
    const replacingActiveWithEnded =
      current && current.id !== stored.id && ["active", "trialing", "past_due"].includes(current.status) && !["active", "trialing", "past_due"].includes(stored.status);
    if (!replacingActiveWithEnded) account.subscription = stored;
    account.stripeCustomerId = account.stripeCustomerId ?? customerId;
  });
  return true;
}

/** Used on the return from Checkout, so Pro turns on even if the webhook hasn't arrived yet. */
export async function syncCheckoutSession(sessionId: string, email: string) {
  const session = await stripeClient().checkout.sessions.retrieve(sessionId);
  if (session.metadata?.[accountMetadataKey] !== accountKey(email)) return false;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (!subscriptionId) return false;
  return syncSubscription(subscriptionId);
}

/**
 * Looks the email up in Stripe and restores a BuilderVault subscription onto the account.
 * Runs when a signed-in visitor without Pro opens their account page, so a missed webhook
 * or a lost account file never leaves a paying customer without Pro.
 */
export async function restoreFromStripe(email: string) {
  const key = accountKey(email);
  const stripe = stripeClient();
  const customers = await stripe.customers.list({ email, limit: 5 });
  for (const customer of customers.data) {
    const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 10 });
    const ours = subscriptions.data.filter((subscription) => subscription.metadata?.[accountMetadataKey] === key);
    const best = ours.find((subscription) => ["active", "trialing", "past_due"].includes(subscription.status)) ?? ours[0];
    if (best) {
      await syncSubscription(best.id);
      return true;
    }
  }
  return false;
}
