import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Dataverse security role patterns | BuilderVault",
  description: "Use Dataverse security role patterns to plan permissions, ownership, matrix reviews, role assumptions, and production-ready access models."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Dataverse security role patterns",
        eyebrow: "Dataverse security",
        description: "Use Dataverse security role patterns to plan permissions, ownership, matrix reviews, role assumptions, and production-ready access models.",
        keywords: ["Dataverse security roles","security matrix","Dataverse permissions"],
        collectionSlugs: ["dataverse-app-foundation-pack","power-platform-admin-governance-kit"],
        match: (pattern) => pattern.category === "Dataverse" && textIncludes(pattern, ["security role", "role", "permission", "access"])
      }}
    />
  );
}
