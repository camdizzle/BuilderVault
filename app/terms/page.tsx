import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Terms of Use | BuilderVault",
  description:
    "Review the BuilderVault terms for using Power Platform examples, implementation patterns, and site content."
};

export default function TermsPage() {
  return (
    <SimplePage
      eyebrow="Terms"
      lead="These terms describe the basic rules for using BuilderVault content, examples, and website features."
      title="Terms of use."
    >
      <p>
        <strong>Last updated:</strong> May 14, 2026
      </p>
      <p>
        These terms are practical boilerplate for the current public version of
        BuilderVault and should be reviewed by qualified counsel before relying on
        them for a commercial launch. By using BuilderVault, you agree to use the
        site responsibly and in accordance with these terms.
      </p>
      <h2>Use of the site</h2>
      <p>
        BuilderVault provides Power Platform patterns, examples, formulas,
        implementation notes, and related educational content. You may use the site
        for lawful business, professional, and learning purposes.
      </p>
      <p>
        You agree not to misuse the site, attempt to disrupt its operation, copy
        content at scale without permission, or use BuilderVault in a way that
        violates applicable laws, third-party rights, or platform terms.
      </p>
      <h2>Pattern content and examples</h2>
      <p>
        BuilderVault examples are provided as starting points. You are responsible
        for reviewing, testing, securing, and adapting any formula, flow,
        configuration, list schema, or implementation pattern before using it in a
        production environment.
      </p>
      <p>
        Results may vary based on your Microsoft 365 tenant, licensing,
        permissions, data volume, governance model, connectors, environment
        settings, and organizational policies.
      </p>
      <h2>No professional advice</h2>
      <p>
        BuilderVault does not provide legal, security, compliance, accounting,
        financial, or professional consulting advice. You should consult qualified
        professionals when decisions require specialized review.
      </p>
      <h2>Accounts, payments, and subscriptions</h2>
      <p>
        BuilderVault does not currently offer paid subscriptions, payment
        processing, or user accounts. If those features are added later, additional
        terms may apply before you use them.
      </p>
      <h2>Intellectual property</h2>
      <p>
        BuilderVault owns or licenses the site design, organization, written
        content, and related materials. You may reference and adapt individual
        implementation examples for your own internal projects, but you may not
        resell, republish, or redistribute the library as a competing product
        without permission.
      </p>
      <h2>Third-party platforms</h2>
      <p>
        BuilderVault discusses Microsoft Power Platform, Microsoft 365, SharePoint,
        Dataverse, and related services. Your use of those platforms is governed by
        the applicable third-party terms, licenses, and documentation.
      </p>
      <h2>Availability and changes</h2>
      <p>
        We may update, remove, or reorganize content at any time. We do not
        guarantee that every page, example, or feature will remain available or
        error-free.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a href="mailto:help@camwow.tv">help@camwow.tv</a>.
      </p>
    </SimplePage>
  );
}
