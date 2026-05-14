import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Power Platform governance and admin patterns | BuilderVault",
  description: "Browse governance patterns for environments, DLP, connector review, maker activity, tenant settings, orphaned apps, support queues, and CoE triage."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Power Platform governance and admin patterns",
        eyebrow: "Power Platform governance",
        description: "Browse governance patterns for environments, DLP, connector review, maker activity, tenant settings, orphaned apps, support queues, and CoE triage.",
        keywords: ["Power Platform governance","DLP policy","environment strategy","maker activity"],
        collectionSlugs: ["power-platform-admin-governance-kit","solution-deployment-checklist"],
        match: (pattern) => textIncludes(pattern, ["govern", "dlp", "data loss", "environment", "tenant", "maker", "connector"])
      }}
    />
  );
}
