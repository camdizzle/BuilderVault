import { ResourceIndexPage } from "@/components/resources/resource-index-page";
import { cheatSheets } from "@/lib/resources";

export const metadata = {
  title: "Power Platform Cheat Sheets | BuilderVault",
  description: "Short references for common Power Apps, Power Automate, SharePoint, Dataverse, and Adaptive Card tasks."
};

export default function Page() {
  return (
    <ResourceIndexPage
      title="Power Platform Cheat Sheets"
      eyebrow="Fast lookup"
      description="Short references for common Power Apps, Power Automate, SharePoint, Dataverse, and Adaptive Card tasks."
      items={cheatSheets}
    />
  );
}