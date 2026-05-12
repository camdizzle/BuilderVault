import { PatternLibrary } from "@/components/patterns/pattern-library";
import { getAllPatterns } from "@/lib/patterns/patterns";

export const metadata = {
  title: "Patterns | BuilderVault"
};

export default function PatternsPage() {
  const patterns = getAllPatterns();

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container">
        <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
          <div className="eyebrow">Pattern library</div>
          <h1 className="page-title" style={{ maxWidth: 850 }}>
            Copy-ready Microsoft 365 implementation patterns.
          </h1>
          <p className="lead" style={{ maxWidth: 820 }}>
            Search by keyword, filter by category, platform, difficulty, access
            level, and tags, then save useful patterns locally for later.
          </p>
        </div>

        <PatternLibrary patterns={patterns} />
      </div>
    </section>
  );
}
