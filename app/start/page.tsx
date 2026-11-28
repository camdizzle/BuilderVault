import Link from "next/link";
import { LearningPathView, pathLinkStyle as linkStyle } from "@/components/learning/learning-path-view";
import { learningPath, learningPathFaqs, learningPathPath } from "@/lib/learning-path";

const title = "Learn Power Apps step by step: a learning path for new makers";
const description =
  "A free, ordered path from your first SharePoint list to a shared canvas app: choose a data source, build a gallery and form, learn Power Fx, filter without delegation warnings, save with Patch, add a flow and share the app.";

export const metadata = {
  title: title + " | BuilderVault",
  description,
  keywords: ["learn Power Apps", "Power Apps for beginners", "Power Apps learning path", "Power Apps tutorial", "how to start with Power Apps", "Power Fx basics"],
  alternates: { canonical: learningPathPath },
  openGraph: { title, description, type: "website", url: learningPathPath }
};

export default function StartPage() {
  return (
    <LearningPathView
      afterPath={
        <>
          Once your first app is shared, the rest of the site is organised by the job in front of you. Look up any function in the <Link href="/functions" style={linkStyle}>Power Fx function reference</Link>, paste an error message into the <Link href="/errors" style={linkStyle}>error library</Link>, copy a tested approach from the <Link href="/patterns" style={linkStyle}>pattern library</Link>, or browse every <Link href="/guides" style={linkStyle}>how-to guide</Link>. To go further with automation, follow the <Link href="/start/flows" style={linkStyle}>Power Automate learning path</Link>.
        </>
      }
      eyebrow="Learning path for new makers"
      faqs={learningPathFaqs}
      heading="Learn Power Apps step by step."
      lead="Seven steps that take you from an empty SharePoint list to a canvas app your team uses. Each step says what you'll learn, links to the guides, functions and tools that teach it, and ends with a checkpoint you can test in your own app before moving on."
      name="Learn Power Apps step by step"
      path={learningPathPath}
      placement="start"
      steps={learningPath}
      stepsHeading="The seven steps"
    />
  );
}
