import { ResourceIndexPage } from "@/components/resources/resource-index-page";
import { tools } from "@/lib/resources";

export const metadata = {
  title: "Free Power Platform Tools | BuilderVault",
  description: "Static utility pages and planned client-side helpers for formulas, expressions, naming, colors, cards, and deployments."
};

export default function Page() {
  return (
    <ResourceIndexPage
      title="Free Power Platform Tools"
      eyebrow="Builder utilities"
      description="Static utility pages and planned client-side helpers for formulas, expressions, naming, colors, cards, and deployments."
      items={tools}
    />
  );
}