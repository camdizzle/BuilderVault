// Analytics configuration. Everything is off unless these build-time env vars are set:
//   NEXT_PUBLIC_PLAUSIBLE_DOMAIN        e.g. buildervault.camwow.tv (cookie-free, no consent banner needed)
//   NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC    optional, defaults to Plausible cloud
//   NEXT_PUBLIC_GA_MEASUREMENT_ID       e.g. G-XXXXXXX (uses cookies; may need a consent banner for EU visitors)
//   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION Search Console HTML-tag verification token

export const analyticsConfig = {
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "",
  plausibleScriptSrc: process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC ?? "https://plausible.io/js/script.js",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? ""
};

export const analyticsEnabled = Boolean(analyticsConfig.plausibleDomain || analyticsConfig.gaMeasurementId);

type EventProps = Record<string, string | number | boolean>;

type AnalyticsWindow = Window & {
  plausible?: (event: string, options?: { props?: EventProps }) => void;
  gtag?: (command: "event", event: string, params?: EventProps) => void;
};

/** Sends a custom event to whichever analytics provider is loaded. Safe to call when none is. */
export function trackEvent(event: string, props: EventProps = {}) {
  if (typeof window === "undefined") return;
  const target = window as AnalyticsWindow;
  try {
    target.plausible?.(event, { props });
    target.gtag?.("event", event, props);
  } catch {
    // Analytics must never break the page.
  }
}
