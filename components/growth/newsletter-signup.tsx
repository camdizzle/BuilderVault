"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { newsletterConfig, newsletterEnabled } from "@/lib/downloads";

type NewsletterSignupProps = {
  /** Where the form is shown, sent with the analytics event. */
  placement: string;
  title?: string;
  text?: string;
};

export function NewsletterSignup({
  placement,
  text = "New patterns, tool updates, and Power Fx tips. One short email when there's something worth sending. Unsubscribe any time.",
  title = "Get new Power Platform patterns by email"
}: NewsletterSignupProps) {
  const [submitted, setSubmitted] = useState(false);

  if (!newsletterEnabled) return null;

  return (
    <section className="card newsletter-signup" style={{ display: "grid", gap: 12, padding: 22 }}>
      <div>
        <div className="eyebrow">Newsletter</div>
        <h2 style={{ fontSize: "1.3rem", margin: "6px 0" }}>{title}</h2>
        <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{text}</p>
      </div>
      {submitted ? (
        <p style={{ fontWeight: 700, margin: 0 }}>Thanks. Check your inbox to confirm your subscription.</p>
      ) : (
        <form
          action={newsletterConfig.formAction}
          className="badge-row"
          method="post"
          onSubmit={() => {
            trackEvent("Newsletter Signup", { placement });
            window.setTimeout(() => setSubmitted(true), 0);
          }}
          target="_blank"
        >
          <label className="field" style={{ flex: "1 1 240px", margin: 0 }}>
            <span className="sr-only">Email address</span>
            <input autoComplete="email" name={newsletterConfig.emailField} placeholder="you@company.com" required type="email" />
          </label>
          <button className="button" type="submit">Subscribe</button>
        </form>
      )}
    </section>
  );
}
