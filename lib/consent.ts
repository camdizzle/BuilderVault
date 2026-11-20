// Cookie consent for Google tags, using Google Consent Mode v2.
// Storage defaults to denied. The visitor's choice is kept in localStorage and re-applied on every page load.

export const CONSENT_STORAGE_KEY = "bv-cookie-consent";
export const CONSENT_OPEN_EVENT = "bv:open-cookie-settings";

export type ConsentChoice = "granted" | "denied";

type ConsentWindow = Window & { dataLayer?: unknown[] };

export function readStoredConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** Saves the choice and tells Google tags about it. */
export function applyConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage can be blocked (private mode). The choice then lasts for this page only.
  }

  const target = window as ConsentWindow;
  target.dataLayer = target.dataLayer || [];
  // Consent Mode reads the gtag-style `arguments` object, so a plain array won't do.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    target.dataLayer!.push(arguments);
  }
  gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice
  });
  target.dataLayer.push({ event: "cookie_consent_update", consent_choice: choice });
}

/**
 * Inline script that must run before any Google tag loads. It sets every storage type to denied,
 * then restores an earlier "granted" choice.
 */
export const consentDefaultScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)})==='granted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}}catch(e){}`;
