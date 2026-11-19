import Script from "next/script";
import { analyticsConfig } from "@/lib/analytics";

export function AnalyticsScripts() {
  const { gaMeasurementId, plausibleDomain, plausibleScriptSrc } = analyticsConfig;

  return (
    <>
      {plausibleDomain ? (
        <>
          <Script data-domain={plausibleDomain} defer src={plausibleScriptSrc} strategy="afterInteractive" />
          <Script id="plausible-queue" strategy="afterInteractive">
            {"window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }"}
          </Script>
        </>
      ) : null}
      {gaMeasurementId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaMeasurementId)});`}
          </Script>
        </>
      ) : null}
    </>
  );
}
