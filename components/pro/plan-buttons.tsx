import Link from "next/link";
import { proPrices, type ProPlan } from "@/lib/pro/plan";
import type { Viewer } from "@/lib/pro/session";

const plans: ProPlan[] = ["monthly", "yearly"];

/** The two price cards. Signed-in visitors go straight to Stripe Checkout; others sign in first. */
export function PlanButtons({ viewer }: { viewer: Viewer | null }) {
  return (
    <div className="pro-plan-grid">
      {plans.map((plan) => {
        const price = proPrices[plan];
        return (
          <div className="card" key={plan} style={{ borderColor: plan === "yearly" ? "#82cdb7" : "var(--line)", display: "grid", gap: 12, padding: 22 }}>
            <h3 style={{ margin: 0 }}>{price.label}</h3>
            <div>
              <span style={{ fontSize: "2rem", fontWeight: 800 }}>{price.amount}</span>
              <span style={{ color: "#415049" }}> per {price.interval}</span>
            </div>
            <p style={{ color: "#415049", margin: 0 }}>
              {plan === "yearly" ? "Two months free compared with paying monthly." : "Cancel any time from your account."}
            </p>
            {viewer?.pro ? (
              <Link className="button secondary" href="/account">
                You have Pro
              </Link>
            ) : viewer ? (
              <form action="/api/pro/checkout" method="post">
                <input name="plan" type="hidden" value={plan} />
                <button className="button" type="submit">
                  Choose {price.label.toLowerCase()}
                </button>
              </form>
            ) : (
              <Link className="button" href="/sign-in?next=/pro">
                Sign in to choose {price.label.toLowerCase()}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
