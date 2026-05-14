import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Dataverse table design patterns for Power Platform apps | BuilderVault",
  description: "Plan Dataverse tables, relationships, choices, business rules, environment variables, solution-aware data models, and SharePoint migration paths."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Dataverse table design patterns for Power Platform apps",
        eyebrow: "Dataverse table design",
        description: "Plan Dataverse tables, relationships, choices, business rules, environment variables, solution-aware data models, and SharePoint migration paths.",
        keywords: ["Dataverse table design","Dataverse relationships","choice columns","data model"],
        collectionSlugs: ["dataverse-app-foundation-pack","solution-deployment-checklist"],
        match: (pattern) => pattern.category === "Dataverse" && textIncludes(pattern, ["table", "relationship", "choice", "data model", "migration"])
      }}
    />
  );
}
