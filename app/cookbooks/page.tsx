import { ResourceIndexPage } from "@/components/resources/resource-index-page";
import { cookbooks } from "@/lib/resources";

export const metadata = {
  title: "Power Platform Cookbooks | BuilderVault",
  description: "Task-based BuilderVault recipes for Power Apps, Power Automate, SharePoint, Dataverse, and ALM builders."
};

export default function Page() {
  return (
    <ResourceIndexPage
      title="Power Platform Cookbooks"
      eyebrow="Copy-ready recipes"
      description="Task-based BuilderVault recipes for Power Apps, Power Automate, SharePoint, Dataverse, and ALM builders."
      items={cookbooks}
    />
  );
}