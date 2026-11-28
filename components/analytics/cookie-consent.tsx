"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { analyticsConfig } from "@/lib/analytics";
import { applyConsent, CONSENT_OPEN_EVENT, readStoredConsent, type ConsentChoice } from "@/lib/consent";

/** Only Google tags set cookies. Plausible is cookie-free and needs no banner. */
export const consentRequired = Boolean(analyticsConfig.gtmId || analyticsConfig.gaMeasurementId);

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!consentRequired) return;
    // Decided after mount so the server-rendered HTML never includes the banner.
    const timer = window.setTimeout(() => {
      if (readStoredConsent() === null) setOpen(true);
    }, 0);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
    };
  }, []);

  if (!consentRequired || !open) return null;

  function choose(choice: ConsentChoice) {
    applyConsent(choice);
    setOpen(false);
  }

  return (
    <section aria-label="Cookie consent" className="cookie-banner" role="region">
      <p>
        BuilderVault uses Google Analytics cookies to see which pages and tools are useful. These cookies are only set if you accept.{" "}
        <Link href="/privacy">Privacy policy</Link>
      </p>
      <div className="cookie-banner-actions">
        <button className="button secondary" onClick={() => choose("denied")} type="button">Reject</button>
        <button className="button secondary" onClick={() => choose("granted")} type="button">Accept</button>
      </div>
    </section>
  );
}

/** Footer link that reopens the banner so a visitor can change their choice. */
export function CookieSettingsButton() {
  if (!consentRequired) return null;

  return (
    <button className="link-button" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))} type="button">
      Cookie settings
    </button>
  );
}
