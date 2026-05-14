import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Power Platform solution deployment patterns | BuilderVault",
  description: "Strengthen ALM with patterns for solution layering, managed deployment, connection references, release notes, rollback decisions, and promotion paths."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Power Platform solution deployment patterns",
        eyebrow: "Solution deployment",
        description: "Strengthen ALM with patterns for solution layering, managed deployment, connection references, release notes, rollback decisions, and promotion paths.",
        keywords: ["Power Platform solutions","managed solution","connection references","deployment checklist"],
        collectionSlugs: ["solution-deployment-checklist","consultant-delivery-pack"],
        match: (pattern) => pattern.category === "ALM & Governance" && textIncludes(pattern, ["solution", "managed", "unmanaged", "deployment", "connection reference", "release"])
      }}
    />
  );
}
