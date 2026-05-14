import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Power Apps Patch patterns for SharePoint and Dataverse saves | BuilderVault",
  description: "Find practical Patch patterns for SharePoint people fields, choice fields, lookup fields, generated request numbers, approval metadata, validation, and reliable save behavior."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Power Apps Patch patterns for SharePoint and Dataverse saves",
        eyebrow: "Power Apps patching",
        description: "Find practical Patch patterns for SharePoint people fields, choice fields, lookup fields, generated request numbers, approval metadata, validation, and reliable save behavior.",
        keywords: ["Power Apps Patch","Patch SharePoint choice field","Patch people picker","Patch lookup field"],
        collectionSlugs: ["power-apps-patching-cookbook","power-apps-app-design-kit"],
        match: (pattern) => pattern.category === "Power Apps" && textIncludes(pattern, ["patch", "people picker", "choice field", "lookup", "save"])
      }}
    />
  );
}
