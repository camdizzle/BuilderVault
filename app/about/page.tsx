import Link from "next/link";
import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "About BuilderVault | Power Platform Patterns and Tools",
  description: "BuilderVault is an independent Power Platform pattern library for Power Apps, Power Automate, SharePoint, Dataverse, ALM, and builder tools."
};

export default function AboutPage() {
  return (
    <SimplePage
      eyebrow="About BuilderVault"
      lead="BuilderVault helps Power Platform makers and developers move faster with practical implementation patterns, examples, standards, cheat sheets, and browser-based tools."
      title="A field guide for building Microsoft business apps."
    >
      <p>
        BuilderVault is focused on the work that happens after a maker already knows what they need to build: saving records correctly, designing list schemas, avoiding delegation problems, handling flow failures, preparing ALM releases, and handing work to another builder without hidden assumptions.
      </p>
      <p>
        The site is intentionally practical. Pattern pages connect to examples, cookbooks, standards, and tools so a Power Platform builder can move from a search question to a usable implementation path quickly.
      </p>
      <h2>Who it is for</h2>
      <ul>
        <li>Canvas app makers building production Power Apps.</li>
        <li>Flow builders creating supportable Power Automate processes.</li>
        <li>SharePoint builders designing list-backed apps.</li>
        <li>Dataverse developers planning tables, roles, and model-driven apps.</li>
        <li>Platform owners standardizing ALM, governance, and support practices.</li>
      </ul>
      <h2>What BuilderVault is not</h2>
      <p>
        BuilderVault is not a replacement for Microsoft documentation, tenant-specific architecture review, legal advice, security review, or production testing. Every pattern should be adapted and validated in your own environment.
      </p>
      <p>
        BuilderVault is an independent resource and is not affiliated with, sponsored by, or endorsed by Microsoft.
      </p>
      <Link className="button" href="/resources" style={{ justifySelf: "start" }}>
        Start with resources
      </Link>
    </SimplePage>
  );
}
