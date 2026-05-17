import { PatternLibrary } from "@/components/patterns/pattern-library";
import { getAllPatterns } from "@/lib/patterns/patterns";

export const metadata = {
  title: "Power Platform Patterns | BuilderVault",
  description:
    "Browse reusable Power Apps, Power Automate, SharePoint, Dataverse, ALM, and Power Platform admin patterns."
};

export default function PatternsPage() {
  const patterns = getAllPatterns();

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container">
        <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
          <div className="eyebrow">Pattern library</div>
          <h1 className="page-title" style={{ maxWidth: 850 }}>
            Copy-ready Power Platform implementation patterns.
          </h1>
          <p className="lead" style={{ maxWidth: 820 }}>
            Search by keyword, platform, difficulty, and tag. The core library is focused on practical Power Platform implementation work for makers, developers, admins, and consultants.
          </p>
        </div>

        <PatternLibrary patterns={patterns} />
      </div>
    </section>
  );
}
