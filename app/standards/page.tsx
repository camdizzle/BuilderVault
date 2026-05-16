import { ResourceIndexPage } from "@/components/resources/resource-index-page";
import { standards } from "@/lib/resources";

export const metadata = {
  title: "Power Platform Standards | BuilderVault",
  description: "Reusable standards for naming, data design, ALM, error handling, logging, and supportable delivery."
};

export default function Page() {
  return (
    <ResourceIndexPage
      title="Power Platform Standards"
      eyebrow="Team conventions"
      description="Reusable standards for naming, data design, ALM, error handling, logging, and supportable delivery."
      items={standards}
    />
  );
}