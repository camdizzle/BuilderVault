import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Power Apps form patterns for intake screens and validation | BuilderVault",
  description: "Build cleaner forms, multi-step intake screens, reusable validation, mobile layouts, role-aware screens, and maker handoff notes for Power Apps delivery."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Power Apps form patterns for intake screens and validation",
        eyebrow: "Power Apps forms",
        description: "Build cleaner forms, multi-step intake screens, reusable validation, mobile layouts, role-aware screens, and maker handoff notes for Power Apps delivery.",
        keywords: ["Power Apps forms","form validation","intake app","multi-step wizard"],
        collectionSlugs: ["power-apps-app-design-kit","request-management-app-kit"],
        match: (pattern) => pattern.category === "Power Apps" && textIncludes(pattern, ["form", "screen", "wizard", "validation", "mobile"])
      }}
    />
  );
}
