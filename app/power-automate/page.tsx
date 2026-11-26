import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { getCollectionBySlug } from "@/lib/patterns/collections";
import { getPublishedPatterns } from "@/lib/patterns/patterns";

export const metadata = {
  title: "Power Automate patterns for reliable workflows | BuilderVault",
  description: "Browse practical Power Automate patterns for approvals, trigger conditions, exception handling, reminders, Teams notifications, flow ownership, and production support."
};

export default function TopicPage() {
  const patterns = getPublishedPatterns()
    .filter((pattern) => pattern.category === "Power Automate")
    .slice(0, 12);
  const collections = ["approval-workflow-starter-kit", "power-automate-error-handling-kit", "notification-and-digest-kit", "teams-adaptive-card-workflows"]
    .map((slug) => getCollectionBySlug(slug))
    .filter((collection): collection is NonNullable<typeof collection> => Boolean(collection));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div style={{ maxWidth: 900 }}>
          <div className="eyebrow">Power Automate hub</div>
          <h1 className="page-title">Power Automate patterns for reliable workflows</h1>
          <p className="lead">Browse practical Power Automate patterns for approvals, trigger conditions, exception handling, reminders, Teams notifications, flow ownership, and production support.</p>
          <div className="badge-row" style={{ marginTop: 18 }}>
            <span className="badge">approval flows</span>
            <span className="badge">trigger conditions</span>
            <span className="badge">try catch scopes</span>
            <span className="badge">Teams cards</span>
            <span className="badge">failed runs</span>
          </div>
        </div>

        <section className="card" style={{ display: "grid", gap: 10, padding: 24 }}>
          <h2 className="section-title" style={{ fontSize: "1.4rem", margin: 0 }}>New to Power Automate?</h2>
          <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>
            Start with the <Link href="/start/flows" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>Power Automate learning path</Link>: six steps from a flow you run yourself to flows your team relies on, each with a checkpoint. Its first step is <Link href="/guides/create-first-power-automate-cloud-flow" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>creating your first cloud flow</Link>.
          </p>
        </section>

        <section style={{ display: "grid", gap: 18 }}>
          <h2 className="section-title">Recommended collections</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {collections.map((collection) => (
              <CollectionCard collection={{ ...collection, count: collection.patternSlugs.length }} key={collection.slug} />
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 18 }}>
          <div style={{ alignItems: "end", display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "space-between" }}>
            <h2 className="section-title" style={{ margin: 0 }}>Featured patterns</h2>
            <Link className="button secondary" href="/patterns">Browse all patterns</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {patterns.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
