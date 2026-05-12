import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Disclaimer | BuilderVault"
};

export default function DisclaimerPage() {
  return (
    <SimplePage
      eyebrow="Disclaimer"
      lead="BuilderVault examples should be treated as starting points, not production-ready guarantees."
      title="Review before using."
    >
      <p>
        Power Apps, SharePoint, Power Automate, and PMO patterns can behave
        differently depending on tenant configuration, permissions, licensing,
        data volume, and governance rules.
      </p>
      <p>
        Test formulas, flows, list schemas, and report templates in a safe
        environment before using them in production. Future AI-generated content
        should be reviewed before sending or publishing.
      </p>
    </SimplePage>
  );
}
