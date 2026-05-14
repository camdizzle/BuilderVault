import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Power Automate trigger condition patterns | BuilderVault",
  description: "Use trigger condition patterns to reduce unnecessary flow runs, detect status changes, scope updates, and keep production flows predictable."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Power Automate trigger condition patterns",
        eyebrow: "Trigger conditions",
        description: "Use trigger condition patterns to reduce unnecessary flow runs, detect status changes, scope updates, and keep production flows predictable.",
        keywords: ["Power Automate trigger condition","status changed trigger","flow trigger scope"],
        collectionSlugs: ["power-automate-error-handling-kit","approval-workflow-starter-kit"],
        match: (pattern) => pattern.category === "Power Automate" && textIncludes(pattern, ["trigger condition", "status changed", "trigger", "condition"])
      }}
    />
  );
}
