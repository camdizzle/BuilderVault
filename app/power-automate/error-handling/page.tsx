import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Power Automate error handling and failed run patterns | BuilderVault",
  description: "Find try/catch scope, failed-run triage, retry, ownership transfer, production support, and exception notification patterns for Power Automate."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Power Automate error handling and failed run patterns",
        eyebrow: "Flow error handling",
        description: "Find try/catch scope, failed-run triage, retry, ownership transfer, production support, and exception notification patterns for Power Automate.",
        keywords: ["Power Automate error handling","try catch scope","failed run triage","flow support"],
        collectionSlugs: ["power-automate-error-handling-kit","consultant-delivery-pack"],
        match: (pattern) => pattern.category === "Power Automate" && textIncludes(pattern, ["try catch", "error", "failed run", "retry", "exception", "support"])
      }}
    />
  );
}
