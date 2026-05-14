import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "SharePoint list schema patterns for Power Platform backends | BuilderVault",
  description: "Design app-ready SharePoint lists with internal names, indexed views, permissions, schema reviews, ownership, lifecycle, and backend support patterns."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "SharePoint list schema patterns for Power Platform backends",
        eyebrow: "SharePoint list schemas",
        description: "Design app-ready SharePoint lists with internal names, indexed views, permissions, schema reviews, ownership, lifecycle, and backend support patterns.",
        keywords: ["SharePoint list schema","internal names","indexed views","Power Apps backend"],
        collectionSlugs: ["sharepoint-backend-starter-kit","request-management-app-kit"],
        match: (pattern) => pattern.category === "SharePoint" && textIncludes(pattern, ["schema", "list", "internal name", "column", "view", "index"])
      }}
    />
  );
}
