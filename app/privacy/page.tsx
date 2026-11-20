import { SimplePage } from "@/components/layout/simple-page";
import { analyticsConfig } from "@/lib/analytics";
import { newsletterEnabled } from "@/lib/downloads";

export const metadata = {
  title: "Privacy Policy | BuilderVault",
  description:
    "Learn how BuilderVault handles basic site data, local browser storage, communications, and privacy requests."
};

export default function PrivacyPage() {
  return (
    <SimplePage
      eyebrow="Privacy"
      lead="This privacy policy explains how BuilderVault handles information when you browse the site, use saved pattern features, or contact us."
      title="Privacy policy."
    >
      <p>
        <strong>Last updated:</strong> November 20, 2026
      </p>
      <p>
        This policy is provided as practical boilerplate for the current public
        version of BuilderVault and should be reviewed by qualified counsel before
        relying on it for a commercial launch.
      </p>
      <h2>Information we collect</h2>
      <p>
        BuilderVault does not currently create user accounts, process payments, or
        ask visitors to submit sensitive personal information. If you contact us by
        email, we may receive your name, email address, organization, and the
        contents of your message.
      </p>
      <p>
        The site may also receive basic technical information through hosting logs,
        such as IP address, browser type, device information, pages visited, and
        timestamps. These logs are used to operate, secure, troubleshoot, and
        improve the website.
      </p>
      <h2>Analytics</h2>
      {analyticsConfig.plausibleDomain ? (
        <p>
          We use Plausible Analytics to count page views and a few anonymous events,
          such as copying formatted code. Plausible does not use cookies and does not
          collect personal information.
        </p>
      ) : null}
      {analyticsConfig.gtmId ? (
        <p>
          We use Google Tag Manager to load Google measurement tags, including Google
          Analytics, so we can understand which pages and tools are useful. These
          tags may set cookies and collect information such as pages visited,
          approximate location, and device type. These cookies are only set if you
          choose Accept on the cookie banner. You can change your choice at any time
          with the Cookie settings link at the bottom of every page. If you reject,
          Google may still receive cookieless, non-identifying signals that a page
          was viewed.
        </p>
      ) : null}
      {analyticsConfig.gaMeasurementId ? (
        <p>
          We use Google Analytics to understand which pages and tools are useful.
          Google Analytics sets cookies and collects information such as pages
          visited, approximate location, and device type. You can opt out with
          Google&apos;s browser add-on or by blocking cookies.
        </p>
      ) : null}
      {!analyticsConfig.plausibleDomain && !analyticsConfig.gaMeasurementId && !analyticsConfig.gtmId ? (
        <p>BuilderVault does not currently run third-party analytics scripts.</p>
      ) : null}
      {newsletterEnabled ? (
        <>
          <h2>Newsletter</h2>
          <p>
            If you subscribe to the newsletter, your email address is sent to our email
            provider and used only to send BuilderVault updates. Every email includes an
            unsubscribe link, and you can ask us to delete your address at any time.
          </p>
        </>
      ) : null}
      <h2>Local storage and preferences</h2>
      <p>
        Some BuilderVault features, such as saved or favorited patterns, may store
        preferences locally in your browser. This information stays on your device
        unless a future account feature is added. Clearing your browser data may
        remove these saved preferences.
      </p>
      <h2>How we use information</h2>
      <p>
        We use information to respond to inquiries, maintain and improve the site,
        understand which content is useful, prevent abuse, and plan future product
        features for Power Platform developers.
      </p>
      <h2>Third-party services</h2>
      <p>
        BuilderVault may rely on service providers for website hosting, security,
        analytics, email delivery, or other operational needs. Those providers may
        process limited information on our behalf according to their own terms and
        privacy practices.
      </p>
      <h2>Data retention</h2>
      <p>
        We keep contact messages and operational records only as long as reasonably
        needed for support, business, security, legal, or compliance purposes.
      </p>
      <h2>Privacy for children</h2>
      <p>
        BuilderVault is intended for professional and educational use by Power
        Platform makers and developers. It is not directed to children under 13.
      </p>
      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as BuilderVault evolves, including if future
        account, payment, analytics, or AI-assisted features are added. Updates will
        be posted on this page with a revised date.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy questions or requests, contact us at{" "}
        <a href="mailto:help@camwow.tv">help@camwow.tv</a>.
      </p>
    </SimplePage>
  );
}

