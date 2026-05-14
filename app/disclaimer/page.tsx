import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Disclaimer | BuilderVault",
  description:
    "Important notes about using BuilderVault Power Platform examples, implementation patterns, and technical guidance."
};

export default function DisclaimerPage() {
  return (
    <SimplePage
      eyebrow="Disclaimer"
      lead="BuilderVault examples are intended to help Power Platform developers move faster, but every implementation should be reviewed before production use."
      title="Review before using."
    >
      <p>
        <strong>Last updated:</strong> May 14, 2026
      </p>
      <h2>Educational content only</h2>
      <p>
        BuilderVault provides educational examples, implementation patterns,
        formulas, flow concepts, schemas, and technical notes for Power Platform
        makers and developers. The content is not a guarantee that a specific
        approach will fit every tenant, project, or production workload.
      </p>
      <h2>Power Platform environments vary</h2>
      <p>
        Power Apps, Power Automate, SharePoint, Dataverse, Power Pages, Teams, and
        related Microsoft services can behave differently depending on licensing,
        permissions, data volume, tenant configuration, environment settings,
        connector policies, delegation limits, data loss prevention policies, and
        governance rules.
      </p>
      <h2>Test before production</h2>
      <p>
        Test every formula, flow, connector, schema, security role, and app pattern
        in a safe environment before using it with live business data. You are
        responsible for validating performance, accessibility, security, compliance,
        error handling, and maintainability for your organization.
      </p>
      <h2>No professional advice</h2>
      <p>
        BuilderVault content does not replace legal, compliance, security,
        licensing, architecture, or professional consulting advice. Seek qualified
        review when your project involves regulated data, contractual obligations,
        production security, or material business risk.
      </p>
      <h2>Independent resource</h2>
      <p>
        BuilderVault is an independent resource. References to Microsoft products
        and services are for educational and compatibility purposes and do not imply
        endorsement, sponsorship, or affiliation unless expressly stated.
      </p>
      <h2>Contact</h2>
      <p>
        To report an issue with a pattern or request a correction, contact{" "}
        <a href="mailto:help@camwow.tv">help@camwow.tv</a>.
      </p>
    </SimplePage>
  );
}
