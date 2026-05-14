import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Power Apps delegation patterns for SharePoint filters and galleries | BuilderVault",
  description: "Use these patterns to avoid delegation warnings, design better gallery filters, shape searchable views, and keep canvas apps responsive as data grows."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Power Apps delegation patterns for SharePoint filters and galleries",
        eyebrow: "Power Apps delegation",
        description: "Use these patterns to avoid delegation warnings, design better gallery filters, shape searchable views, and keep canvas apps responsive as data grows.",
        keywords: ["Power Apps delegation","SharePoint filters","gallery search","delegation warning"],
        collectionSlugs: ["delegation-survival-kit","power-apps-app-design-kit"],
        match: (pattern) => pattern.category === "Power Apps" && textIncludes(pattern, ["delegation", "filter", "gallery", "search", "performance"])
      }}
    />
  );
}
