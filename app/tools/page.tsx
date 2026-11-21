import { ResourceIndexPage } from "@/components/resources/resource-index-page";
import { tools } from "@/lib/resources";

const description = `${tools.length} free browser tools for Power Apps, Power Automate, SharePoint and Dataverse: format Power Fx, build expressions and filter queries, check delegation, generate schemas and cards, and more. Everything runs in your browser.`;

export const metadata = {
  title: "Free Power Platform Tools | BuilderVault",
  description
};

export default function Page() {
  return (
    <ResourceIndexPage
      title="Free Power Platform Tools"
      eyebrow="Builder utilities"
      description={description}
      items={tools}
    />
  );
}