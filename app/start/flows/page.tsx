import Link from "next/link";
import { LearningPathView, pathLinkStyle as linkStyle } from "@/components/learning/learning-path-view";
import { flowLearningPath, flowLearningPathFaqs, flowLearningPathPath } from "@/lib/flow-learning-path";

const title = "Learn Power Automate step by step: a learning path for new flow makers";
const description =
  "A free, ordered path from your first instant flow to flows your team relies on: triggers and actions, SharePoint flows, Filter Queries, expressions, approvals, calling flows from Power Apps and fixing failed runs.";

export const metadata = {
  title: title + " | BuilderVault",
  description,
  keywords: ["learn Power Automate", "Power Automate for beginners", "Power Automate learning path", "Power Automate tutorial", "how to start with Power Automate", "first cloud flow"],
  alternates: { canonical: flowLearningPathPath },
  openGraph: { title, description, type: "website", url: flowLearningPathPath }
};

export default function StartFlowsPage() {
  return (
    <LearningPathView
      afterPath={
        <>
          Once your flows run reliably, look up a specific failure in the <Link href="/errors" style={linkStyle}>error library</Link>, copy a tested design from the <Link href="/power-automate" style={linkStyle}>Power Automate patterns</Link>, or browse every <Link href="/guides" style={linkStyle}>how-to guide</Link>. To build the app that starts your flows, follow the <Link href="/start" style={linkStyle}>Power Apps learning path</Link>.
        </>
      }
      eyebrow="Learning path for new flow makers"
      faqs={flowLearningPathFaqs}
      heading="Learn Power Automate step by step."
      lead="Six steps that take you from a flow you run yourself to flows your team relies on. Each step says what you'll learn, links to the guides and tools that teach it, and ends with a checkpoint you can test in your own flow before moving on."
      name="Learn Power Automate step by step"
      path={flowLearningPathPath}
      placement="start-flows"
      steps={flowLearningPath}
      stepsHeading="The six steps"
    />
  );
}
