import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Power Automate approval flow patterns | BuilderVault",
  description: "Browse approval routing, status sync, timeout escalation, audit trails, Teams cards, reminders, and requester notification patterns for reliable workflow delivery."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Power Automate approval flow patterns",
        eyebrow: "Approval workflows",
        description: "Browse approval routing, status sync, timeout escalation, audit trails, Teams cards, reminders, and requester notification patterns for reliable workflow delivery.",
        keywords: ["Power Automate approvals","approval timeout","approval status sync","approval audit trail"],
        collectionSlugs: ["approval-workflow-starter-kit","notification-and-digest-kit"],
        match: (pattern) => pattern.category === "Power Automate" && textIncludes(pattern, ["approval", "approvals", "manager", "route", "reminder"])
      }}
    />
  );
}
