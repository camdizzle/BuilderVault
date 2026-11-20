import Script from "next/script";
import { analyticsConfig } from "@/lib/analytics";
import { consentDefaultScript } from "@/lib/consent";

export function AnalyticsScripts() {
  const { gaMeasurementId, gtmId, plausibleDomain, plausibleScriptSrc } = analyticsConfig;

  return (
    <>
      {gtmId ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`${consentDefaultScript}
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
        </Script>
      ) : null}
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
            {`${consentDefaultScript}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaMeasurementId)});`}
          </Script>
        </>
      ) : null}
    </>
  );
}

/** Google Tag Manager fallback for browsers with JavaScript turned off. Goes first inside <body>. */
export function GtmNoScript() {
  const { gtmId } = analyticsConfig;
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        height="0"
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
        width="0"
      />
    </noscript>
  );
}
