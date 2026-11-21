import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SimplePage } from "@/components/layout/simple-page";
import { PlanButtons } from "@/components/pro/plan-buttons";
import { proEnabled, proSettings } from "@/lib/pro/config";
import { hasActiveSubscription, isComplimentary, proPrices } from "@/lib/pro/plan";
import { currentViewer } from "@/lib/pro/session";
import { restoreFromStripe, syncCheckoutSession } from "@/lib/pro/stripe";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false }
};

const errors: Record<string, string> = {
  portal: "Billing could not open just now. Please try again in a minute.",
  "no-billing": "There is no billing record for this account yet."
};

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ checkout?: string; error?: string }> }) {
  if (!proEnabled()) notFound();
  const params = await searchParams;
  let viewer = await currentViewer();
  if (!viewer) redirect("/sign-in?next=/account");

  // Back from Stripe Checkout: check Stripe directly so Pro shows at once, even before the webhook lands.
  let checkoutPending = false;
  if (params.checkout && /^cs_[A-Za-z0-9_]+$/.test(params.checkout) && !viewer.pro) {
    try {
      await syncCheckoutSession(params.checkout, viewer.email);
      viewer = (await currentViewer()) ?? viewer;
    } catch (error) {
      console.error("Pro checkout return check failed:", (error as Error).message);
    }
    checkoutPending = !viewer.pro;
  } else if (!viewer.pro && proSettings().stripeSecretKey) {
    // No Pro on file: check Stripe in case a webhook was missed or the account file was lost.
    try {
      if (await restoreFromStripe(viewer.email)) viewer = (await currentViewer()) ?? viewer;
    } catch (error) {
      console.error("Pro restore from Stripe failed:", (error as Error).message);
    }
  }

  const subscription = viewer.account?.subscription ?? null;
  const paid = hasActiveSubscription(viewer.account);
  const complimentary = !paid && isComplimentary(viewer.email, proSettings().compEmails);
  const canManageBilling = Boolean(viewer.account?.stripeCustomerId);

  let planLine = "Free";
  if (paid && subscription) {
    const price = subscription.plan ? proPrices[subscription.plan] : null;
    planLine = "Pro" + (price ? ", " + price.amount + " per " + price.interval : "");
  } else if (complimentary) {
    planLine = "Pro (complimentary)";
  }

  let renewalLine = "";
  if (paid && subscription?.currentPeriodEnd) {
    if (subscription.cancelAtPeriodEnd) renewalLine = "Pro ends on " + formatDate(subscription.currentPeriodEnd) + " and will not renew.";
    else if (subscription.status === "past_due") renewalLine = "Your last payment didn't go through. Update your card in Manage billing to keep Pro.";
    else renewalLine = "Renews on " + formatDate(subscription.currentPeriodEnd) + ".";
  }

  return (
    <SimplePage eyebrow="Account" lead={"Signed in as " + viewer.email + "."} title="Your account.">
      {params.checkout && viewer.pro ? (
        <p className="pro-notice" role="status">
          Thanks for upgrading. Pro is on, and the <Link href="/tools/power-fx-formatter">Power Fx formatter</Link> now saves your settings and history.
        </p>
      ) : null}
      {checkoutPending ? (
        <p className="pro-notice" role="status">
          Stripe is still confirming your payment. Refresh this page in a minute; Pro turns on as soon as it is confirmed.
        </p>
      ) : null}
      {params.error && errors[params.error] ? (
        <p className="pro-notice error" role="alert">
          {errors[params.error]}
        </p>
      ) : null}

      <div className="card" style={{ display: "grid", gap: 8, padding: 22 }}>
        <div className="eyebrow">Plan</div>
        <strong style={{ fontSize: "1.4rem" }}>{planLine}</strong>
        {renewalLine ? <p style={{ color: "#415049", margin: 0 }}>{renewalLine}</p> : null}
        {canManageBilling ? (
          <form action="/api/pro/portal" method="post" style={{ marginTop: 8 }}>
            <button className="button secondary" style={{ cursor: "pointer", font: "inherit", fontWeight: 700 }} type="submit">
              Manage billing
            </button>
          </form>
        ) : null}
        {canManageBilling ? (
          <p style={{ color: "#415049", fontSize: "0.9rem", margin: 0 }}>Cancel, switch between monthly and yearly, update your card, or download invoices on Stripe.</p>
        ) : null}
      </div>

      {viewer.pro ? (
        <p>
          Your formatter settings and history are saved from the <Link href="/tools/power-fx-formatter">Power Fx formatter</Link>.
        </p>
      ) : (
        <>
          <h2>Upgrade to Pro</h2>
          <PlanButtons viewer={viewer} />
          <p>
            <Link href="/pro">See what Pro adds</Link>
          </p>
        </>
      )}

      <form action="/api/auth/sign-out" method="post">
        <button className="link-button" style={{ color: "#415049" }} type="submit">
          Sign out
        </button>
      </form>
    </SimplePage>
  );
}
