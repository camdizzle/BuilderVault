import { SeoHubPage, textIncludes } from "@/components/patterns/seo-hub-page";

export const metadata = {
  title: "Teams Adaptive Card workflow patterns | BuilderVault",
  description: "Build Teams and Adaptive Card workflow experiences for approvals, queue digests, response capture, user mentions, retries, and handoff messaging."
};

export default function Page() {
  return (
    <SeoHubPage
      config={{
        title: "Teams Adaptive Card workflow patterns",
        eyebrow: "Adaptive Cards",
        description: "Build Teams and Adaptive Card workflow experiences for approvals, queue digests, response capture, user mentions, retries, and handoff messaging.",
        keywords: ["Adaptive Cards","Teams notifications","approval card","Power Automate cards"],
        collectionSlugs: ["teams-adaptive-card-workflows","approval-workflow-starter-kit"],
        match: (pattern) => textIncludes(pattern, ["adaptive card", "card", "teams", "mention"])
      }}
    />
  );
}
