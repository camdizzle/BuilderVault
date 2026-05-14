import { SimplePage } from "@/components/layout/simple-page";

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
        <strong>Last updated:</strong> May 14, 2026
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

